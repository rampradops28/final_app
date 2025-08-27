import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Mic,
  MicOff,
  Plus,
  Minus,
  RotateCcw,
  FileText,
  Settings,
} from "lucide-react";
import { useState } from "react";

export default function VoiceControlPanel({
  isListening,
  isSupported,
  lastCommand,
  onToggleListening,
  onLanguageChange,
  onVoiceFeedbackChange,
  voiceFeedbackEnabled,
}) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <Card className="shadow-sm border border-gray-100">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-lg font-semibold text-gray-900"
            data-testid="text-voice-controls-title"
          >
            Voice Controls
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            data-testid="button-settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="language-select"
                className="text-sm font-medium"
              >
                Voice Language
              </Label>
              <Select onValueChange={onLanguageChange} defaultValue="en-US">
                <SelectTrigger
                  id="language-select"
                  data-testid="select-language"
                >
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="ta-IN">Tamil (தமிழ்)</SelectItem>
                  <SelectItem value="mixed">Mixed (Tamil + English)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="voice-feedback"
                checked={voiceFeedbackEnabled}
                onCheckedChange={onVoiceFeedbackChange}
                data-testid="switch-voice-feedback"
              />
              <Label htmlFor="voice-feedback" className="text-sm">
                Voice Feedback (Repeat orders)
              </Label>
            </div>
          </div>
        )}

        {/* Voice Activation Button */}
        <div className="text-center mb-6">
          <Button
            onClick={onToggleListening}
            className={`w-32 h-32 rounded-full text-3xl transition-all transform hover:scale-105 shadow-xl ${
              isListening
                ? "bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse"
                : "bg-primary hover:bg-blue-700"
            }`}
            data-testid="button-voice-toggle"
          >
            {isListening ? (
              <MicOff className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </Button>
          <p
            className="text-sm text-gray-600 mt-4"
            data-testid="text-voice-instruction"
          >
            {isSupported
              ? isListening
                ? "Tap to stop listening"
                : "Tap to activate voice commands"
              : "Setting up voice recognition..."}
          </p>

          {/* Debug info in development */}
          {!isSupported && process.env.NODE_ENV === "development" && (
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
              <p>Debug: Checking browser compatibility...</p>
              <p>
                Browser:{" "}
                {navigator.userAgent.includes("Chrome")
                  ? "Chrome"
                  : navigator.userAgent.includes("Edge")
                  ? "Edge"
                  : "Other"}
              </p>
              <p>
                Secure: {window.location.protocol === "https:" ? "Yes" : "No"}
              </p>
            </div>
          )}
        </div>

        {/* Voice Commands Guide */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Available Commands:</h3>
          <div className="text-sm space-y-2">
            <div className="flex items-center space-x-2" data-testid="command-add">
              <Plus className="text-success w-4 h-4" />
              <span className="text-gray-700">
                "Add [item] [quantity] [unit] [price]"
              </span>
            </div>
            <div className="text-xs text-gray-500 ml-6">
              Units: kg, packet, box, piece, liter, etc.
            </div>
            <div className="flex items-center space-x-2" data-testid="command-remove">
              <Minus className="text-error w-4 h-4" />
              <span className="text-gray-700">"Remove [item]"</span>
            </div>
            <div className="flex items-center space-x-2" data-testid="command-reset">
              <RotateCcw className="text-warning w-4 h-4" />
              <span className="text-gray-700">"Reset bill"</span>
            </div>
            <div className="flex items-center space-x-2" data-testid="command-generate">
              <FileText className="text-primary w-4 h-4" />
              <span className="text-gray-700">"Generate invoice"</span>
            </div>
          </div>
        </div>

        {/* Last Command Display */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Last Command:</p>
          <p
            className="font-medium text-gray-900"
            data-testid="text-last-command"
          >
            {lastCommand || "No command yet"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
