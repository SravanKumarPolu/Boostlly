import { useState, useEffect, useCallback, useRef } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Alert,
} from "@boostlly/ui";
import {
  Mic,
  MicOff,
  Volume2,
  Settings,
  Command,
  BookOpen,
  Target,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  useAutoTheme,
  logError,
  logDebug,
} from "@boostlly/core";

interface VoiceCommandsProps {
  userQuotes?: any[];
  userPreferences?: any;
  onQuoteSelect?: (quote: any) => void;
  onNavigate: (tab: string) => void;
}

interface VoiceCommand {
  phrase: string;
  action: string;
  description: string;
  category: "navigation" | "quotes" | "settings";
}

export function VoiceCommands({ onNavigate }: VoiceCommandsProps) {
  const { palette } = useAutoTheme();

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [recognition, setRecognition] = useState<any>(null);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 1.0,
    volume: 0.8,
  });
  const [microphonePermission, setMicrophonePermission] = useState<
    "granted" | "denied" | "prompt" | "unknown"
  >("unknown");
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Essential voice commands - simplified list
  const voiceCommands: VoiceCommand[] = [
    // Navigation commands
    { phrase: "go to today", action: "navigate", description: "Navigate to Today tab", category: "navigation" },
    { phrase: "open search", action: "navigate", description: "Navigate to Search tab", category: "navigation" },
    { phrase: "open collections", action: "navigate", description: "Navigate to Collections tab", category: "navigation" },
    { phrase: "open saved", action: "navigate", description: "Navigate to Saved tab", category: "navigation" },
    { phrase: "open stats", action: "navigate", description: "Navigate to Stats tab", category: "navigation" },
    { phrase: "open settings", action: "navigate", description: "Navigate to Settings tab", category: "navigation" },
    
    // Quote commands
    { phrase: "read quote", action: "read", description: "Read current quote aloud", category: "quotes" },
    { phrase: "read", action: "read", description: "Read current quote aloud", category: "quotes" },
    { phrase: "next quote", action: "next", description: "Go to next quote", category: "quotes" },
    { phrase: "save quote", action: "save", description: "Save current quote", category: "quotes" },
    { phrase: "like quote", action: "like", description: "Like current quote", category: "quotes" },
    
    // Settings commands
    { phrase: "increase volume", action: "volume", description: "Increase speech volume", category: "settings" },
    { phrase: "decrease volume", action: "volume", description: "Decrease speech volume", category: "settings" },
    { phrase: "faster speech", action: "rate", description: "Increase speech rate", category: "settings" },
    { phrase: "slower speech", action: "rate", description: "Decrease speech rate", category: "settings" },
    { phrase: "stop listening", action: "stop", description: "Stop voice recognition", category: "settings" },
    { phrase: "start listening", action: "start", description: "Start voice recognition", category: "settings" },
  ];

  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Initialize speech synthesis
    if ("speechSynthesis" in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }

    // Check if we're in an extension context
    const isExtension =
      typeof window !== "undefined" &&
      !!(window as any).chrome?.storage?.local &&
      !!(window as any).chrome?.runtime?.id;

    if (isExtension) {
      logDebug("Voice features disabled in extension context");
      setIsSupported(false);
      setError("Voice features are not available in extension context");
      return;
    }

    // Initialize speech recognition with better browser detection
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          setCurrentTranscript("Listening...");
          setError(null);
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
          } else {
            setCurrentTranscript(interimTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          logError("Speech recognition error:", { error: event.error });
          setIsListening(false);

          const err = event?.error;
          switch (err) {
            case "no-speech":
              setCurrentTranscript("No speech detected. Try speaking again.");
              setError(null); // Clear error for no-speech as it's not critical
              break;
            case "audio-capture":
              setError("Microphone not found or access denied. Please check your microphone settings.");
              setMicrophonePermission("denied");
              break;
            case "not-allowed":
              setError("Microphone permission denied. Please allow microphone access in your browser settings.");
              setMicrophonePermission("denied");
              break;
            case "network":
              setError("Network error occurred. Please check your internet connection and try again.");
              break;
            case "service-not-allowed":
              setError("Speech recognition service not allowed. Please check your browser settings.");
              break;
            case "aborted":
              // User stopped or navigated away - not an error
              setError(null);
              break;
            default:
              setError(`Speech recognition error: ${event.error || "Unknown error"}. Please try again.`);
          }
        };

        recognition.onend = () => {
          if (isListening) {
            try {
              recognition.start();
              setIsListening(true);
            } catch (err) {
              // If restart fails, stop listening gracefully
              setIsListening(false);
            }
          } else {
            setIsListening(false);
            if (!error) {
              setCurrentTranscript("");
            }
          }
        };

        setRecognition(recognition);
        setIsSupported(true);
        setError(null);
      } catch (err) {
        // If creating recognition instance fails
        setIsSupported(false);
        setError("Failed to initialize speech recognition. Please refresh the page and try again.");
        logError("Failed to create SpeechRecognition instance:", { error: err });
      }
    } else {
      setIsSupported(false);
      // Detect browser for better error message
      const userAgent = navigator.userAgent.toLowerCase();
      let browserName = "your browser";
      if (userAgent.includes("firefox")) {
        browserName = "Firefox";
      } else if (userAgent.includes("safari") && !userAgent.includes("chrome")) {
        browserName = "Safari";
      } else if (userAgent.includes("chrome")) {
        browserName = "Chrome";
      } else if (userAgent.includes("edge")) {
        browserName = "Edge";
      }
      
      setError(
        `Speech recognition is not supported in ${browserName}. Voice commands work best in Chrome, Edge, or Safari. You can still use text-to-speech features.`
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

    // Request initial settings
    try {
      window.dispatchEvent(new CustomEvent("boostlly:settings:request"));
    } catch {}
  }, []);

  // Listen for settings updates
  useEffect(() => {
    const onSettingsUpdate = (e: any) => {
      const detail = e?.detail || {};
      setVoiceSettings((prev) => {
        const next = { ...prev };
        if (typeof detail.speechRate === "number") {
          next.rate = detail.speechRate;
        } else if (detail.speechRate === "INCREMENT") {
          next.rate = Math.min(2, Number((prev.rate + 0.1).toFixed(1)));
        } else if (detail.speechRate === "DECREMENT") {
          next.rate = Math.max(0.5, Number((prev.rate - 0.1).toFixed(1)));
        }
        if (typeof detail.speechVolume === "number") {
          next.volume = Math.max(0, Math.min(1, (detail.speechVolume as number) / 100));
        } else if (detail.speechVolume === "INCREMENT") {
          next.volume = Math.min(1, Number((prev.volume + 0.1).toFixed(2)));
        } else if (detail.speechVolume === "DECREMENT") {
          next.volume = Math.max(0, Number((prev.volume - 0.1).toFixed(2)));
        }
        return next;
      });
    };
    window.addEventListener("boostlly:settings:update", onSettingsUpdate as any);
    return () =>
      window.removeEventListener("boostlly:settings:update", onSettingsUpdate as any);
  }, []);

  // Persist settings to localStorage
  const persistSettings = (detail: { speechRate?: number; speechVolume?: number }) => {
    try {
      if (typeof window === "undefined") return;
      if (typeof detail.speechRate === "number") {
        localStorage.setItem("speechRate", String(detail.speechRate));
      }
      if (typeof detail.speechVolume === "number") {
        localStorage.setItem("speechVolume", String(detail.speechVolume));
      }
    } catch {}
  };

  // Process voice commands
  const processVoiceCommand = useCallback(
    (transcript: string) => {
      const normalized = transcript.trim().toLowerCase();
      const bestMatch = voiceCommands.find(
        (cmd) =>
          normalized === cmd.phrase ||
          normalized.startsWith(cmd.phrase) ||
          cmd.phrase.startsWith(normalized),
      );

      if (bestMatch) {
        executeCommand(bestMatch);
        speakResponse(`Executing: ${bestMatch.description}`);
      } else {
        speakResponse("I didn't understand that command. Please try again.");
      }
    },
    [voiceCommands],
  );

  // Execute voice command
  const executeCommand = (command: VoiceCommand) => {
    switch (command.action) {
      case "navigate":
        if (command.phrase.includes("today")) onNavigate("today");
        else if (command.phrase.includes("search")) onNavigate("search");
        else if (command.phrase.includes("collections")) onNavigate("collections");
        else if (command.phrase.includes("saved")) onNavigate("saved");
        else if (command.phrase.includes("stats")) onNavigate("stats");
        else if (command.phrase.includes("settings")) onNavigate("settings");
        break;
      case "read": {
        const el =
          (document.querySelector("[data-current-quote]") as HTMLElement) ||
          (document.querySelector(".today-quote-text") as HTMLElement);
        const textToRead = el?.getAttribute("data-current-quote") || el?.textContent?.trim() || "";
        if (textToRead) {
          speakResponse(`"${textToRead}"`);
        } else {
          speakResponse("Reading current quote");
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
            const volumePercent = Math.round(next.volume * 100);
            window.dispatchEvent(
              new CustomEvent("boostlly:settings:update", {
                detail: { speechVolume: volumePercent },
              }),
            );
            persistSettings({ speechVolume: volumePercent });
            return next;
          });
        } else if (command.phrase.includes("decrease")) {
          setVoiceSettings((prev) => {
            const next = { ...prev, volume: Math.max(0, prev.volume - 0.1) };
            const volumePercent = Math.round(next.volume * 100);
            window.dispatchEvent(
              new CustomEvent("boostlly:settings:update", {
                detail: { speechVolume: volumePercent },
              }),
            );
            persistSettings({ speechVolume: volumePercent });
            return next;
          });
        }
        break;
      case "rate":
        if (command.phrase.includes("faster")) {
          setVoiceSettings((prev) => {
            const next = { ...prev, rate: Math.min(2, prev.rate + 0.1) };
            window.dispatchEvent(
              new CustomEvent("boostlly:settings:update", {
                detail: { speechRate: Number(next.rate.toFixed(1)) },
              }),
            );
            persistSettings({ speechRate: Number(next.rate.toFixed(1)) });
            return next;
          });
        } else if (command.phrase.includes("slower")) {
          setVoiceSettings((prev) => {
            const next = { ...prev, rate: Math.max(0.5, prev.rate - 0.1) };
            window.dispatchEvent(
              new CustomEvent("boostlly:settings:update", {
                detail: { speechRate: Number(next.rate.toFixed(1)) },
              }),
            );
            persistSettings({ speechRate: Number(next.rate.toFixed(1)) });
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
      stream.getTracks().forEach((track) => track.stop());
      setMicrophonePermission("granted");
      setError(null);
      setCurrentTranscript("Microphone permission granted! You can now use voice commands.");
    } catch (error) {
      setMicrophonePermission("denied");
      setError("Microphone permission denied. Please allow microphone access in your browser settings.");
    }
  };

  // Start/stop listening
  const toggleListening = () => {
    if (!recognition) return;

    if (microphonePermission === "denied" || microphonePermission === "unknown") {
      requestMicrophonePermission();
      return;
    }

    if (isListening) {
      try {
        recognition.stop();
      } catch {}
      window.dispatchEvent(
        new CustomEvent("boostlly:voice:enable", {
          detail: { enabled: true },
        }),
      );
    } else {
      window.dispatchEvent(
        new CustomEvent("boostlly:voice:enable", {
          detail: { enabled: false },
        }),
      );
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2
            className="text-2xl font-bold flex items-center gap-2"
            style={{ color: palette?.fg || "hsl(var(--foreground))" }}
          >
            <Mic className="w-6 h-6 text-primary" />
            Voice Commands
          </h2>
          <p className="text-sm text-foreground/70 mt-1">
            Control the app using voice commands and text-to-speech
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {voiceCommands.length} commands available
        </Badge>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert 
          variant={error.includes("not supported") ? "default" : "destructive"}
          className="border-2"
        >
          <AlertCircle className="w-4 h-4" />
          <div className="flex-1">
            <p className="font-medium mb-1 text-foreground">
              {error.includes("not supported") ? "Browser Compatibility" : "Error"}
            </p>
            <p className="text-sm leading-relaxed text-foreground">{error}</p>
            {error.includes("not supported") && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs text-foreground/70 mb-2">
                  <strong className="text-foreground">Note:</strong> Text-to-speech features are still available even if voice recognition isn't supported.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    Chrome ✓
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Edge ✓
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Safari ✓
                  </Badge>
                </div>
              </div>
            )}
            {error.includes("permission") && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestMicrophonePermission}
                  className="w-full sm:w-auto"
                >
                  Request Permission
                </Button>
              </div>
            )}
          </div>
        </Alert>
      )}

      {/* Voice Control Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Mic className="w-5 h-5" />
            Voice Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-foreground">
          {/* Microphone Status */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-3">
              {isListening ? (
                <div className="relative">
                  <Mic className="w-6 h-6 text-primary animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                </div>
              ) : (
                <MicOff className="w-6 h-6 text-muted-foreground" />
              )}
              <div>
                <div className="font-medium text-foreground">
                  {isListening ? "Listening..." : isSupported ? "Ready" : "Not supported"}
                </div>
                <div className="text-sm text-foreground/70">
                  {microphonePermission === "granted"
                    ? "Microphone access granted"
                    : microphonePermission === "denied"
                    ? "Microphone access denied"
                    : "Microphone permission required"}
                </div>
              </div>
            </div>
            <Button
              onClick={toggleListening}
              variant={isListening ? "destructive" : "default"}
              disabled={!isSupported || microphonePermission === "denied"}
              className="gap-2"
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  Start Listening
                </>
              )}
            </Button>
            {microphonePermission === "denied" && (
              <Button
                onClick={requestMicrophonePermission}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Grant Permission
              </Button>
            )}
          </div>

          {/* Current Transcript */}
          {currentTranscript && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="text-xs font-medium text-primary mb-1">Current Input</div>
              <div className="text-sm text-foreground">{currentTranscript}</div>
            </div>
          )}

          {/* Text-to-Speech Test */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">Text-to-Speech</div>
                <div className="text-sm text-foreground/70">
                  Test the speech synthesis engine
                </div>
              </div>
              <Badge variant={isSpeaking ? "default" : "outline"}>
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
          </div>
        </CardContent>
      </Card>

      {/* Voice Commands Reference */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-foreground">Available Commands</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["navigation", "quotes", "settings"].map((category) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-foreground">
                  {category === "navigation" && <Target className="w-4 h-4" />}
                  {category === "quotes" && <BookOpen className="w-4 h-4" />}
                  {category === "settings" && <Settings className="w-4 h-4" />}
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-foreground">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {getCommandsByCategory(category).map((command, index) => (
                    <div key={index} className="pb-3 border-b last:border-0 border-border/50">
                      <div className="font-medium text-sm mb-1 text-foreground">
                        "{command.phrase}"
                      </div>
                      <div className="text-xs text-foreground/70">
                        {command.description}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Settings Link */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Settings className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-foreground mb-1">
                  Configure Audio Settings
                </div>
                <p className="text-sm text-foreground/70">
                  Adjust speech rate, volume, and notification sounds in Settings → Audio tab
                </p>
              </div>
            </div>
            <Button
              onClick={() => onNavigate("settings")}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Settings className="w-4 h-4 mr-2" />
              Open Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
