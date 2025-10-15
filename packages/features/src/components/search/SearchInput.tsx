import { useState, useRef, useEffect } from "react";
import { Input, Button } from "@boostlly/ui";
import { Search, X, Mic, MicOff } from "lucide-react";
import { useVoiceCommands } from "../../hooks";

/**
 * Props for the SearchInput component
 */
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
  voiceEnabled?: boolean;
  onVoiceToggle?: () => void;
  isListening?: boolean;
  className?: string;
}

/**
 * SearchInput component with autocomplete suggestions and voice commands
 *
 * Provides a search input field with:
 * - Real-time suggestions
 * - Voice command support
 * - Clear functionality
 * - Keyboard navigation
 *
 * @param props - Component props
 * @returns JSX element
 *
 * @example
 * ```tsx
 * <SearchInput
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   onSearch={performSearch}
 *   suggestions={suggestions}
 *   voiceEnabled={true}
 *   onVoiceToggle={toggleVoice}
 *   isListening={isListening}
 * />
 * ```
 */
export function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = "Search quotes...",
  suggestions = [],
  onSuggestionSelect,
  voiceEnabled = false,
  onVoiceToggle,
  isListening = false,
  className = "",
}: SearchInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  /**
   * Handles input change and shows suggestions
   */
  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setShowSuggestions(newValue.trim().length > 0 && suggestions.length > 0);
    setSelectedIndex(-1);
  };

  /**
   * Handles form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  /**
   * Handles suggestion selection
   */
  const handleSuggestionSelect = (suggestion: string) => {
    onChange(suggestion);
    onSuggestionSelect?.(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  /**
   * Handles keyboard navigation in suggestions
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") {
        handleSubmit(e);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  /**
   * Handles clicking outside to close suggestions
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Scrolls selected suggestion into view
   */
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pr-10"
          />
          {value && (
            <button
              type="button"
              onClick={() => handleInputChange("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {voiceEnabled && (
          <Button
            type="button"
            variant={isListening ? "destructive" : "outline"}
            size="sm"
            onClick={onVoiceToggle}
            className="px-3"
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </Button>
        )}

        <Button type="submit" size="sm" disabled={!value.trim()}>
          <Search size={16} />
        </Button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionSelect(suggestion)}
              className={`w-full px-4 py-2 text-left hover:bg-accent/10 ${
                index === selectedIndex
                  ? "bg-accent/20 text-accent-foreground"
                  : "text-foreground"
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
