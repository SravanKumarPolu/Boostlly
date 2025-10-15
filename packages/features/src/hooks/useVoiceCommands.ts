import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Voice command configuration interface
 */
export interface VoiceCommandConfig {
  enabled: boolean;
  language: string;
  continuous: boolean;
  interimResults: boolean;
}

/**
 * Voice command result interface
 */
export interface VoiceCommandResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

/**
 * Voice command handler interface
 */
export interface VoiceCommandHandler {
  command: string | RegExp;
  handler: (transcript: string, confidence: number) => void;
  description?: string;
}

/**
 * Voice status type
 */
export type VoiceStatus = "off" | "ready" | "listening" | "error";

/**
 * Custom hook for managing voice commands and speech recognition
 *
 * @param config - Voice command configuration
 * @param commands - Array of voice command handlers
 * @returns Object containing voice state and methods
 *
 * @example
 * ```tsx
 * const voiceCommands = useVoiceCommands(
 *   { enabled: true, language: 'en-US' },
 *   [
 *     {
 *       command: /search for (.*)/,
 *       handler: (transcript, confidence) => {
 *         const query = transcript.match(/search for (.*)/)?.[1];
 *         if (query) performSearch(query);
 *       }
 *     }
 *   ]
 * );
 * ```
 */
export function useVoiceCommands(
  config: VoiceCommandConfig = {
    enabled: false,
    language: "en-US",
    continuous: false,
    interimResults: false,
  },
  commands: VoiceCommandHandler[] = [],
) {
  const [status, setStatus] = useState<VoiceStatus>("off");
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);

  // Check if speech recognition is supported
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition && config.enabled) {
      recognitionRef.current = new SpeechRecognition();
      setupRecognition();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [config.enabled, config.language]);

  /**
   * Sets up the speech recognition instance with configuration
   */
  const setupRecognition = useCallback(() => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;

    recognition.continuous = config.continuous;
    recognition.interimResults = config.interimResults;
    recognition.lang = config.language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setStatus("listening");
      isListeningRef.current = true;
      setError(null);
    };

    recognition.onresult = (event) => {
      const result = event.results[event.resultIndex];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;

      setTranscript(transcript);
      setConfidence(confidence);

      // Process voice commands
      if (result.isFinal) {
        processVoiceCommand(transcript, confidence);
      }
    };

    recognition.onerror = (event) => {
      setError(event.error);
      setStatus("error");
      isListeningRef.current = false;
    };

    recognition.onend = () => {
      setStatus("ready");
      isListeningRef.current = false;
    };
  }, [config.continuous, config.interimResults, config.language]);

  /**
   * Processes voice commands against registered handlers
   *
   * @param transcript - The recognized speech transcript
   * @param confidence - The confidence score of the recognition
   */
  const processVoiceCommand = useCallback(
    (transcript: string, confidence: number) => {
      const normalizedTranscript = transcript.toLowerCase().trim();

      for (const { command, handler } of commands) {
        if (typeof command === "string") {
          if (normalizedTranscript.includes(command.toLowerCase())) {
            handler(transcript, confidence);
            break;
          }
        } else if (command instanceof RegExp) {
          if (command.test(normalizedTranscript)) {
            handler(transcript, confidence);
            break;
          }
        }
      }
    },
    [commands],
  );

  /**
   * Starts voice recognition
   */
  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported || isListeningRef.current)
      return;

    try {
      recognitionRef.current.start();
      setStatus("ready");
    } catch (error) {
      setError("Failed to start voice recognition");
      setStatus("error");
    }
  }, [isSupported]);

  /**
   * Stops voice recognition
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  /**
   * Toggles voice recognition on/off
   */
  const toggleListening = useCallback(() => {
    if (status === "listening") {
      stopListening();
    } else {
      startListening();
    }
  }, [status, startListening, stopListening]);

  /**
   * Enables or disables voice commands
   */
  const setEnabled = useCallback(
    (enabled: boolean) => {
      if (enabled && !config.enabled) {
        // Reinitialize recognition
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          recognitionRef.current = new SpeechRecognition();
          setupRecognition();
        }
      } else if (!enabled && config.enabled) {
        // Stop and cleanup
        stopListening();
        recognitionRef.current = null;
        setStatus("off");
      }
    },
    [config.enabled, setupRecognition, stopListening],
  );

  /**
   * Updates voice command configuration
   */
  const updateConfig = useCallback(
    (newConfig: Partial<VoiceCommandConfig>) => {
      const updatedConfig = { ...config, ...newConfig };

      if (recognitionRef.current) {
        setupRecognition();
      }
    },
    [config, setupRecognition],
  );

  /**
   * Clears the current transcript
   */
  const clearTranscript = useCallback(() => {
    setTranscript("");
    setConfidence(0);
  }, []);

  return {
    // State
    status,
    isSupported,
    transcript,
    confidence,
    error,
    isListening: status === "listening",

    // Methods
    startListening,
    stopListening,
    toggleListening,
    setEnabled,
    updateConfig,
    clearTranscript,
  };
}
