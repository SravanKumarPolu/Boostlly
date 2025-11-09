import { useState, useEffect, useCallback, useRef } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Progress,
} from "@boostlly/ui";
import {
  Mic,
  Volume2,
  Settings,
  Brain,
  Command,
  Clock,
  BookOpen,
  Target,
} from "lucide-react";
import {
  Quote,
  UserPreferences,
  useAutoTheme,
  logError,
  logDebug,
  logWarning,
} from "@boostlly/core";

interface VoiceCommandsProps {
  userQuotes: Quote[];
  userPreferences: UserPreferences;
  onQuoteSelect: (quote: Quote) => void;
  onNavigate: (tab: string) => void;
}

interface VoiceCommand {
  phrase: string;
  action: string;
  description: string;
  category: "navigation" | "quotes" | "settings";
  confidence: number;
}

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  timestamp: Date;
}

export function VoiceCommands({ onNavigate }: VoiceCommandsProps) {
  // Use auto-theme palette for dynamic contrast
  const { palette } = useAutoTheme();

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [commandHistory, setCommandHistory] = useState<
    SpeechRecognitionResult[]
  >([]);
  const [recognition, setRecognition] = useState<any>(null);
  const [speechSynthesis, setSpeechSynthesis] =
    useState<SpeechSynthesis | null>(null);
  const receivedSeedRef = useRef(false);
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8,
    voice: "default",
  });
  const [microphonePermission, setMicrophonePermission] = useState<
    "granted" | "denied" | "prompt" | "unknown"
  >("unknown");
  const [isSupported, setIsSupported] = useState(true);

  // Voice commands configuration
  const voiceCommands: VoiceCommand[] = [
    // Navigation commands
    {
      phrase: "go to today",
      action: "navigate",
      description: "Navigate to Today tab",
      category: "navigation",
      confidence: 0.9,
    },
    {
      phrase: "open search",
      action: "navigate",
      description: "Navigate to Search tab",
      category: "navigation",
      confidence: 0.9,
    },
    {
      phrase: "open collections",
      action: "navigate",
      description: "Navigate to Collections tab",
      category: "navigation",
      confidence: 0.9,
    },
    {
      phrase: "open saved",
      action: "navigate",
      description: "Navigate to Saved tab",
      category: "navigation",
      confidence: 0.9,
    },
    {
      phrase: "open your",
      action: "navigate",
      description: "Navigate to Your Quotes tab",
      category: "navigation",
      confidence: 0.9,
    },
    {
      phrase: "open your quotes",
      action: "navigate",
      description: "Navigate to Your Quotes tab",
      category: "navigation",
      confidence: 0.9,
    },
    {
      phrase: "open stats",
      action: "navigate",
      description: "Navigate to Stats tab",
      category: "navigation",
      confidence: 0.9,
    },
    {
      phrase: "open community stats",
      action: "navigate",
      description: "Navigate to Community Stats tab",
      category: "navigation",
      confidence: 0.9,
    },
    {
      phrase: "open voice",
      action: "navigate",
      description: "Navigate to Voice tab",
      category: "navigation",
      confidence: 0.9,
    },
    {
      phrase: "open sync",
      action: "navigate",
      description: "Navigate to Sync tab",
      category: "navigation",
      confidence: 0.9,
    },
    {
      phrase: "open settings",
      action: "navigate",
      description: "Navigate to Settings tab",
      category: "navigation",
      confidence: 0.9,
    },

    // Quote commands
    {
      phrase: "read quote",
      action: "read",
      description: "Read current quote aloud",
      category: "quotes",
      confidence: 0.8,
    },
    {
      phrase: "read",
      action: "read",
      description: "Read current quote aloud",
      category: "quotes",
      confidence: 0.8,
    },
    {
      phrase: "next quote",
      action: "next",
      description: "Go to next quote",
      category: "quotes",
      confidence: 0.8,
    },
    {
      phrase: "previous quote",
      action: "previous",
      description: "Go to previous quote",
      category: "quotes",
      confidence: 0.8,
    },
    {
      phrase: "save quote",
      action: "save",
      description: "Save current quote",
      category: "quotes",
      confidence: 0.8,
    },
    {
      phrase: "like quote",
      action: "like",
      description: "Like current quote",
      category: "quotes",
      confidence: 0.8,
    },
    {
      phrase: "share quote",
      action: "share",
      description: "Share current quote",
      category: "quotes",
      confidence: 0.8,
    },


    // Settings commands
    {
      phrase: "increase volume",
      action: "volume",
      description: "Increase speech volume",
      category: "settings",
      confidence: 0.9,
    },
    {
      phrase: "decrease volume",
      action: "volume",
      description: "Decrease speech volume",
      category: "settings",
      confidence: 0.9,
    },
    {
      phrase: "faster speech",
      action: "rate",
      description: "Increase speech rate",
      category: "settings",
      confidence: 0.9,
    },
    {
      phrase: "slower speech",
      action: "rate",
      description: "Decrease speech rate",
      category: "settings",
      confidence: 0.9,
    },
    {
      phrase: "stop listening",
      action: "stop",
      description: "Stop voice recognition",
      category: "settings",
      confidence: 0.9,
    },
    {
      phrase: "start listening",
      action: "start",
      description: "Start voice recognition",
      category: "settings",
      confidence: 0.9,
    },
  ];

  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Initialize speech synthesis
    if ("speechSynthesis" in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }

    // Check if we're in an extension context - only disable for actual Chrome extensions
    const isExtension =
      typeof window !== "undefined" &&
      !!(window as any).chrome?.storage?.local &&
      !!(window as any).chrome?.runtime?.id;

    if (isExtension) {
      logDebug("Voice features disabled in extension context");
      return;
    }

    // Initialize speech recognition with better browser support
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setCurrentTranscript("Listening...");
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setCurrentTranscript(finalTranscript);
          processVoiceCommand(finalTranscript.toLowerCase());
          setCommandHistory((prev) => [
            ...prev,
            {
              transcript: finalTranscript,
              confidence:
                event.results[event.results.length - 1][0].confidence || 0.8,
              timestamp: new Date(),
            },
          ]);
        } else {
          setCurrentTranscript(interimTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        logError("Speech recognition error:", { error: event.error });

        let errorMessage = "Speech recognition error";
        const err = event?.error;
        switch (err) {
          case "no-speech":
            errorMessage = "No speech detected. Listening...";
            // Soft-recover: restart recognition to keep session alive
            try {
              recognition.stop();
            } catch {}
            try {
              recognition.start();
              setIsListening(true);
            } catch {}
            break;
          case "audio-capture":
            errorMessage = "Microphone not found or access denied.";
            setIsListening(false);
            break;
          case "not-allowed":
            errorMessage =
              "Microphone permission denied. Please allow microphone access.";
            setIsListening(false);
            break;
          case "network":
            errorMessage = "Network error occurred.";
            // Attempt soft recovery
            try {
              recognition.stop();
            } catch {}
            try {
              recognition.start();
              setIsListening(true);
            } catch {}
            break;
          case "service-not-allowed":
            errorMessage = "Speech recognition service not allowed.";
            setIsListening(false);
            break;
          default:
            errorMessage = `Error: ${event.error}`;
            // Try to recover for unknown transient errors
            try {
              recognition.stop();
            } catch {}
            try {
              recognition.start();
              setIsListening(true);
            } catch {}
        }
        setCurrentTranscript(errorMessage);
      };

      recognition.onend = () => {
        // If we believe listening should still be on, auto-restart.
        if (isListening) {
          try {
            recognition.start();
            setIsListening(true);
            setCurrentTranscript((t) =>
              t && !t.startsWith("Error:") ? t : "Listening...",
            );
            return;
          } catch {}
        }
        setIsListening(false);
        if (!currentTranscript.includes("Error:")) {
          setCurrentTranscript("");
        }
      };

      setRecognition(recognition);
    } else {
      setIsSupported(false);
      setCurrentTranscript(
        "Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.",
      );
    }

    // Check microphone permission
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((result) => {
          setMicrophonePermission(result.state);
        })
        .catch(() => {
          setMicrophonePermission("unknown");
        });
    }
    // Request initial settings snapshot so UI starts correct
    try {
      window.dispatchEvent(new CustomEvent("boostlly:settings:request"));
    } catch {}
  }, []);

  // Reflect external settings updates in local UI/state
  useEffect(() => {
    const onSettingsUpdate = (e: any) => {
      const detail = e?.detail || {};
      if (
        typeof detail.speechRate === "number" ||
        typeof detail.speechVolume === "number"
      ) {
        receivedSeedRef.current = true;
      }
      setVoiceSettings((prev) => {
        const next = { ...prev };
        if (typeof detail.speechRate === "number") {
          next.rate = detail.speechRate;
        } else if (
          detail.speechRate === "INCREMENT" ||
          detail.speechRate === "DECREMENT"
        ) {
          const delta = detail.speechRate === "INCREMENT" ? 0.1 : -0.1;
          next.rate = Math.max(
            0.5,
            Math.min(2, Number((next.rate + delta).toFixed(1))),
          );
        }
        if (typeof detail.speechVolume === "number") {
          next.volume = Math.max(
            0,
            Math.min(1, (detail.speechVolume as number) / 100),
          );
        } else if (
          detail.speechVolume === "INCREMENT" ||
          detail.speechVolume === "DECREMENT"
        ) {
          const deltaPct = detail.speechVolume === "INCREMENT" ? 0.1 : -0.1;
          next.volume = Math.max(
            0,
            Math.min(1, Number((next.volume + deltaPct).toFixed(2))),
          );
        }
        return next;
      });
    };
    window.addEventListener(
      "boostlly:settings:update",
      onSettingsUpdate as any,
    );
    return () =>
      window.removeEventListener(
        "boostlly:settings:update",
        onSettingsUpdate as any,
      );
  }, []);

  // Helper: persist to localStorage in web-only contexts
  const persistWeb = (detail: {
    speechRate?: number;
    speechVolume?: number;
    textToSpeech?: boolean;
  }) => {
    try {
      if (typeof window === "undefined") return;
      if (typeof detail.speechRate === "number") {
        localStorage.setItem("speechRate", String(detail.speechRate));
      }
      if (typeof detail.speechVolume === "number") {
        localStorage.setItem("speechVolume", String(detail.speechVolume));
      }
      if (typeof detail.textToSpeech === "boolean") {
        localStorage.setItem("textToSpeech", String(detail.textToSpeech));
      }
    } catch {}
  };

  // Process voice commands
  const processVoiceCommand = useCallback(
    (transcript: string) => {
      const normalized = transcript.trim().toLowerCase();
      let bestMatch: VoiceCommand | null = null;
      let bestScore = 0;

      // Prefer exact/contains matches first
      bestMatch =
        voiceCommands.find(
          (cmd) =>
            normalized === cmd.phrase ||
            normalized.startsWith(cmd.phrase) ||
            cmd.phrase.startsWith(normalized),
        ) || null;

      if (!bestMatch) {
        // Fallback to fuzzy similarity
        voiceCommands.forEach((command) => {
          const score = calculateSimilarity(normalized, command.phrase);
          if (score > bestScore && score >= 0.5) {
            bestScore = score;
            bestMatch = command;
          }
        });
      }

      if (bestMatch) {
        executeCommand(bestMatch);
        speakResponse(`Executing: ${(bestMatch as VoiceCommand).description}`);
      } else {
        speakResponse("I didn't understand that command. Please try again.");
      }
    },
    [voiceCommands],
  );

  // Calculate similarity between transcript and command
  const calculateSimilarity = (transcript: string, command: string): number => {
    const transcriptWords = transcript.split(" ");
    const commandWords = command.split(" ");

    let matches = 0;
    transcriptWords.forEach((word) => {
      if (
        commandWords.some(
          (cmdWord) => word.includes(cmdWord) || cmdWord.includes(word),
        )
      ) {
        matches++;
      }
    });

    return matches / Math.max(transcriptWords.length, commandWords.length);
  };

  // Execute voice command
  const executeCommand = (command: VoiceCommand) => {
    switch (command.action) {
      case "navigate":
        if (command.phrase.includes("today")) onNavigate("today");
        else if (command.phrase.includes("search")) onNavigate("search");
        else if (
          command.phrase.includes("community") &&
          command.phrase.includes("stats")
        )
          onNavigate("community-stats");
        else if (command.phrase.includes("collections"))
          onNavigate("collections");
        else if (command.phrase.includes("saved")) onNavigate("saved");
        else if (command.phrase.includes("your")) onNavigate("create");
        else if (command.phrase.includes("stats")) onNavigate("stats");
        else if (command.phrase.includes("voice")) onNavigate("voice");
        else if (command.phrase.includes("settings")) onNavigate("settings");
        break;
      case "read": {
        // Try to read the current quote from a well-known selector or data attribute
        let textToRead = "";
        const el =
          (document.querySelector("[data-current-quote]") as HTMLElement) ||
          (document.querySelector(".today-quote-text") as HTMLElement);

        if (el) {
          // Try data attribute first, then text content
          textToRead =
            el.getAttribute("data-current-quote") ||
            el.textContent?.trim() ||
            "";
        }

        if (textToRead) {
          speakResponse(`"${textToRead}"`);
        } else {
          speakResponse("Reading current quote");
          // Emit a custom event so containers can hook into it if needed
          window.dispatchEvent(
            new CustomEvent("boostlly:voice", { detail: { action: "read" } }),
          );
        }
        break;
      }
      case "next":
      case "previous":
      case "save":
      case "like":
      case "share":
        window.dispatchEvent(
          new CustomEvent("boostlly:voice", {
            detail: { action: command.action },
          }),
        );
        speakResponse(command.description);
        break;

      case "volume":
        if (command.phrase.includes("increase")) {
          setVoiceSettings((prev) => {
            const next = { ...prev, volume: Math.min(1, prev.volume + 0.1) };
            try {
              window.dispatchEvent(
                new CustomEvent("boostlly:settings:update", {
                  detail: { speechVolume: Math.round(next.volume * 100) },
                }),
              );
              persistWeb({ speechVolume: Math.round(next.volume * 100) });
            } catch {}
            return next;
          });
        } else if (command.phrase.includes("decrease")) {
          setVoiceSettings((prev) => {
            const next = { ...prev, volume: Math.max(0, prev.volume - 0.1) };
            try {
              window.dispatchEvent(
                new CustomEvent("boostlly:settings:update", {
                  detail: { speechVolume: Math.round(next.volume * 100) },
                }),
              );
              persistWeb({ speechVolume: Math.round(next.volume * 100) });
            } catch {}
            return next;
          });
        }
        break;

      case "rate":
        if (command.phrase.includes("faster")) {
          setVoiceSettings((prev) => {
            const next = { ...prev, rate: Math.min(2, prev.rate + 0.1) };
            try {
              window.dispatchEvent(
                new CustomEvent("boostlly:settings:update", {
                  detail: { speechRate: Number(next.rate.toFixed(1)) },
                }),
              );
              persistWeb({ speechRate: Number(next.rate.toFixed(1)) });
            } catch {}
            return next;
          });
        } else if (command.phrase.includes("slower")) {
          setVoiceSettings((prev) => {
            const next = { ...prev, rate: Math.max(0.5, prev.rate - 0.1) };
            try {
              window.dispatchEvent(
                new CustomEvent("boostlly:settings:update", {
                  detail: { speechRate: Number(next.rate.toFixed(1)) },
                }),
              );
              persistWeb({ speechRate: Number(next.rate.toFixed(1)) });
            } catch {}
            return next;
          });
        }
        break;

      case "stop":
        if (recognition) {
          recognition.stop();
          setIsListening(false);
        }
        break;

      case "start":
        if (recognition) {
          recognition.start();
          setIsListening(true);
        }
        break;
    }
  };

  // Text-to-speech function
  const speakResponse = (text: string) => {
    if (speechSynthesis && !isSpeaking) {
      setIsSpeaking(true);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      speechSynthesis.speak(utterance);
    }
  };

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop()); // Stop the stream immediately
      setMicrophonePermission("granted");
      setCurrentTranscript(
        "Microphone permission granted! You can now use voice commands.",
      );
    } catch (error) {
      setMicrophonePermission("denied");
      setCurrentTranscript(
        "Microphone permission denied. Please allow microphone access in your browser settings.",
      );
    }
  };

  // Start/stop listening
  const toggleListening = () => {
    if (!recognition) return;

    if (
      microphonePermission === "denied" ||
      microphonePermission === "unknown"
    ) {
      requestMicrophonePermission();
      return;
    }

    if (isListening) {
      try {
        recognition.stop();
      } catch {}
      // Re-enable global listener when panel stops
      try {
        window.dispatchEvent(
          new CustomEvent("boostlly:voice:enable", {
            detail: { enabled: true },
          }),
        );
      } catch {}
    } else {
      // Ensure global listener is disabled to avoid conflicts
      try {
        window.dispatchEvent(
          new CustomEvent("boostlly:voice:enable", {
            detail: { enabled: false },
          }),
        );
      } catch {}
      try {
        recognition.start();
      } catch {}
    }
  };

  // Filter commands by category
  const getCommandsByCategory = (category: string) => {
    return voiceCommands.filter((cmd) => cmd.category === category);
  };

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2
            className="text-lg sm:text-xl font-bold flex items-center gap-2"
            style={{ color: palette?.fg || "hsl(var(--foreground))" }}
          >
            <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 shrink-0" />
            <span className="break-words">Voice Commands & Speech Integration</span>
          </h2>
          <p
            className="text-xs sm:text-sm mt-1"
            style={{ color: palette?.fg ? `color-mix(in srgb, ${palette.fg} 80%, transparent)` : "hsl(var(--foreground) / 0.8)" }}
          >
            Control your extension using voice commands and text-to-speech
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm shrink-0">
          <div
            className="flex items-center gap-1"
            style={{ color: palette?.fg || "hsl(var(--foreground))" }}
          >
            <Command
              className="w-3 h-3 sm:w-4 sm:h-4 shrink-0"
              style={{ color: palette?.fg || "hsl(var(--foreground))" }}
            />
            <span className="whitespace-nowrap">{voiceCommands.length} commands available</span>
          </div>
        </div>
      </div>

      {/* Voice Control Panel */}
      <Card className="overflow-hidden">
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Mic className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>Voice Control Center</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Start/Stop Listening */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm">
                <div className="font-medium">Microphone</div>
                <div 
                  className="text-sm mt-1"
                  style={{ 
                    color: palette?.fg ? `color-mix(in srgb, ${palette.fg} 70%, transparent)` : "hsl(var(--muted-foreground) / 0.9)"
                  }}
                >
                  {isListening
                    ? "Listening..."
                    : isSupported
                      ? "Idle"
                      : "Not supported"}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={isListening ? "default" : "outline"} className="shrink-0">
                  {isListening ? "Live" : "Stopped"}
                </Badge>
                <Button
                  onClick={toggleListening}
                  variant={isListening ? "outline" : "default"}
                  className="flex-1 sm:flex-initial min-w-0 text-xs sm:text-sm"
                >
                  {isListening ? "Stop Listening" : "Start Listening"}
                </Button>
              </div>
            </div>

            {/* Text-to-Speech */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-sm font-medium">Text-to-Speech</span>
                <Badge variant={isSpeaking ? "default" : "outline"} className="shrink-0">
                  {isSpeaking ? "Speaking" : "Ready"}
                </Badge>
              </div>

              <Button
                onClick={() =>
                  speakResponse(
                    "Hello! I am your voice assistant. How can I help you today?",
                  )
                }
                variant="outline"
                className="w-full"
                disabled={!speechSynthesis || isSpeaking}
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Test Speech
              </Button>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">Speech Rate</span>
                  <span className="font-medium">{voiceSettings.rate.toFixed(1)}x</span>
                </div>
                <Progress
                  value={((voiceSettings.rate - 0.5) / 1.5) * 100}
                  className="h-2 w-full"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Commands Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {["navigation", "quotes", "settings"].map((category) => (
          <Card key={category} className="border-l-4 border-border overflow-hidden">
            <CardHeader className="pb-3 px-3 sm:px-6">
              <CardTitle className="text-sm flex items-center gap-2">
                {category === "navigation" && <Target className="w-4 h-4 shrink-0" />}
                {category === "quotes" && <BookOpen className="w-4 h-4 shrink-0" />}
                {category === "settings" && <Settings className="w-4 h-4 shrink-0" />}
                <span className="break-words">{category.charAt(0).toUpperCase() + category.slice(1)} Commands</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-3 sm:px-6">
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {getCommandsByCategory(category).map((command, index) => (
                  <div key={index} className="text-xs pb-2 border-b border-border/50 last:border-0">
                    <div className="font-medium mb-1" style={{ color: palette?.fg || "hsl(var(--foreground))" }}>
                      "{command.phrase}"
                    </div>
                    <div 
                      className="text-xs leading-relaxed"
                      style={{ 
                        color: palette?.fg ? `color-mix(in srgb, ${palette.fg} 75%, transparent)` : "hsl(var(--muted-foreground) / 0.85)"
                      }}
                    >
                      {command.description}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Command History */}
      <Card className="overflow-hidden">
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>Recent Commands</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {commandHistory
              .slice(-10)
              .reverse()
              .map((result, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-accent/20 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Command className="w-4 h-4 text-blue-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm break-words">{result.transcript}</div>
                      <div 
                        className="text-xs mt-1"
                        style={{ 
                          color: palette?.fg ? `color-mix(in srgb, ${palette.fg} 70%, transparent)` : "hsl(var(--muted-foreground) / 0.85)"
                        }}
                      >
                        {result.timestamp.toLocaleTimeString()} • Confidence:{" "}
                        {Math.round(result.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0 self-start sm:self-auto">
                    {Math.round(result.confidence * 100)}%
                  </Badge>
                </div>
              ))}
            {commandHistory.length === 0 && (
              <div 
                className="text-center py-8"
                style={{ 
                  color: palette?.fg ? `color-mix(in srgb, ${palette.fg} 60%, transparent)` : "hsl(var(--muted-foreground) / 0.7)"
                }}
              >
                <Mic className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">
                  No commands yet. Start speaking to see your command history!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Voice Settings */}
      <Card className="overflow-hidden">
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>Voice Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Speech Rate</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.rate}
                  onChange={(e) =>
                    setVoiceSettings((prev) => ({
                      ...prev,
                      rate: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full"
                />
                <div className="text-center text-sm font-medium">
                  {voiceSettings.rate.toFixed(1)}x
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Speech Volume</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Quiet</span>
                  <span>Loud</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={voiceSettings.volume}
                  onChange={(e) =>
                    setVoiceSettings((prev) => ({
                      ...prev,
                      volume: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full"
                />
                <div className="text-center text-sm font-medium">
                  {Math.round(voiceSettings.volume * 100)}%
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Speech Pitch</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Low</span>
                  <span>High</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.pitch}
                  onChange={(e) =>
                    setVoiceSettings((prev) => ({
                      ...prev,
                      pitch: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full"
                />
                <div className="text-center text-sm font-medium">
                  {voiceSettings.pitch.toFixed(1)}x
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
