import React, { useState, useEffect } from "react";
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Badge } from "@boostlly/ui";
import { EmailService } from "@boostlly/core";
import type { EmailSubscription, EmailPreferences } from "@boostlly/core";
import { 
  Mail, 
  Check, 
  X, 
  Clock, 
  Settings, 
  Bell,
  Globe,
  FileText,
  Lightbulb,
  Calendar
} from "lucide-react";

interface EmailSubscriptionProps {
  onSubscribe?: (email: string) => void;
  onUnsubscribe?: (email: string) => void;
  variant?: "default" | "compact" | "inline";
  showPreferences?: boolean;
}

export function EmailSubscription({
  onSubscribe,
  onUnsubscribe,
  variant = "default",
  showPreferences = true
}: EmailSubscriptionProps) {
  const [email, setEmail] = useState("");
  const [preferences, setPreferences] = useState<EmailPreferences>({
    frequency: "daily",
    categories: ["motivation", "productivity"],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    format: "html",
    includeArticles: true,
    includeTips: true
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "subscribing" | "subscribed" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<EmailSubscription | null>(null);
  const [showPreferencesForm, setShowPreferencesForm] = useState(false);

  const emailService = new EmailService();

  useEffect(() => {
    // Check if user is already subscribed
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    if (!email) return;
    
    try {
      const response = await emailService.getSubscription(email);
      if (response.success && response.data) {
        setSubscription(response.data);
        setStatus("subscribed");
        setPreferences(response.data.preferences);
      }
    } catch (error) {
      console.error("Failed to check subscription:", error);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);
    setStatus("subscribing");

    try {
      const response = await emailService.subscribe(email, preferences);
      if (response.success) {
        setSubscription(response.data);
        setStatus("subscribed");
        onSubscribe?.(email);
      } else {
        setError(response.error || "Failed to subscribe");
        setStatus("error");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setError("Failed to subscribe. Please try again.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!subscription) return;

    setLoading(true);
    try {
      const response = await emailService.unsubscribe(subscription.email);
      if (response.success) {
        setSubscription(null);
        setStatus("idle");
        onUnsubscribe?.(subscription.email);
      } else {
        setError("Failed to unsubscribe. Please try again.");
      }
    } catch (error) {
      console.error("Unsubscribe error:", error);
      setError("Failed to unsubscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreferences = async () => {
    if (!subscription) return;

    setLoading(true);
    try {
      const response = await emailService.updatePreferences(subscription.email, preferences);
      if (response.success) {
        setSubscription(response.data);
        setShowPreferencesForm(false);
      } else {
        setError("Failed to update preferences. Please try again.");
      }
    } catch (error) {
      console.error("Update preferences error:", error);
      setError("Failed to update preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "daily": return "Daily";
      case "weekly": return "Weekly";
      case "monthly": return "Monthly";
      default: return "Daily";
    }
  };

  const getFormatLabel = (format: string) => {
    return format === "html" ? "HTML" : "Text";
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
        />
        <Button 
          onClick={handleSubscribe}
          disabled={loading || !email}
          size="sm"
        >
          {loading ? "..." : "Subscribe"}
        </Button>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubscribe} className="flex items-center gap-2">
        <Input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !email}>
          {loading ? "..." : "Subscribe"}
        </Button>
      </form>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-purple-600" />
          Daily Motivation Newsletter
        </CardTitle>
        <p className="text-gray-600">
          Get inspiring quotes and motivational articles delivered to your inbox daily.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {status === "subscribed" && subscription ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              <span className="font-medium">You're subscribed!</span>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Email:</strong> {subscription.email}
              </p>
              <p className="text-sm text-green-800">
                <strong>Frequency:</strong> {getFrequencyLabel(subscription.preferences.frequency)}
              </p>
              <p className="text-sm text-green-800">
                <strong>Format:</strong> {getFormatLabel(subscription.preferences.format)}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPreferencesForm(!showPreferencesForm)}
                className="flex-1"
              >
                <Settings className="w-4 h-4 mr-2" />
                {showPreferencesForm ? "Hide" : "Edit"} Preferences
              </Button>
              <Button
                variant="outline"
                onClick={handleUnsubscribe}
                disabled={loading}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Unsubscribe
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
              />
            </div>

            {showPreferences && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Frequency</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["daily", "weekly", "monthly"].map((freq) => (
                    <Button
                      key={freq}
                      type="button"
                      variant={preferences.frequency === freq ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreferences(prev => ({ ...prev, frequency: freq as any }))}
                      className="text-xs"
                    >
                      {getFrequencyLabel(freq)}
                    </Button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Format</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {["html", "text"].map((format) => (
                    <Button
                      key={format}
                      type="button"
                      variant={preferences.format === format ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreferences(prev => ({ ...prev, format: format as any }))}
                      className="text-xs"
                    >
                      {getFormatLabel(format)}
                    </Button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={preferences.includeArticles}
                      onChange={(e) => setPreferences(prev => ({ ...prev, includeArticles: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">Include motivational articles</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={preferences.includeTips}
                      onChange={(e) => setPreferences(prev => ({ ...prev, includeTips: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">Include productivity tips</span>
                  </label>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !email}
              className="w-full"
            >
              {loading ? "Subscribing..." : "Subscribe to Newsletter"}
            </Button>
          </form>
        )}

        {showPreferencesForm && subscription && (
          <div className="border-t pt-6 space-y-4">
            <h4 className="font-medium text-gray-900">Update Preferences</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["daily", "weekly", "monthly"].map((freq) => (
                    <Button
                      key={freq}
                      type="button"
                      variant={preferences.frequency === freq ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreferences(prev => ({ ...prev, frequency: freq as any }))}
                    >
                      {getFrequencyLabel(freq)}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["html", "text"].map((format) => (
                    <Button
                      key={format}
                      type="button"
                      variant={preferences.format === format ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreferences(prev => ({ ...prev, format: format as any }))}
                    >
                      {getFormatLabel(format)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferences.includeArticles}
                    onChange={(e) => setPreferences(prev => ({ ...prev, includeArticles: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Include motivational articles</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferences.includeTips}
                    onChange={(e) => setPreferences(prev => ({ ...prev, includeTips: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Include productivity tips</span>
                </label>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleUpdatePreferences}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Updating..." : "Update Preferences"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPreferencesForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• We respect your privacy and never share your email</p>
          <p>• You can unsubscribe at any time</p>
          <p>• Daily quotes delivered to your inbox</p>
        </div>
      </CardContent>
    </Card>
  );
}
