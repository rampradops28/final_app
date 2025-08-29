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
  List,
  Calculator,
  HelpCircle,
  StopCircle,
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
  onQuickCommand,
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [quickSelect, setQuickSelect] = useState("add");

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
          {/* Dropdown quick runner */}
          <div className="p-3 bg-gray-50 rounded-md space-y-2">
            <div className="flex items-center gap-2">
              <Select value={quickSelect} onValueChange={setQuickSelect}>
                <SelectTrigger className="w-full" data-testid="select-quick-command">
                  <SelectValue placeholder="Choose a command" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add — "Add [item] [quantity] [unit] [price]"</SelectItem>
                  <SelectItem value="remove">Remove — "Remove [item]"</SelectItem>
                  <SelectItem value="reset">Reset bill — "Reset bill"</SelectItem>
                  <SelectItem value="generate">Generate invoice — "Generate invoice"</SelectItem>
                  <SelectItem value="list">List items — "List items"</SelectItem>
                  <SelectItem value="total">Get total — "What is the total"</SelectItem>
                  <SelectItem value="remove_last">Remove last — "Remove last item"</SelectItem>
                  <SelectItem value="help">Help — "Help"</SelectItem>
                  <SelectItem value="stop">Stop listening — "Stop listening"</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={() => {
                  const map = {
                    add: "add potato 1 piece 50",
                    remove: "remove potato",
                    reset: "reset bill",
                    generate: "generate invoice",
                    list: "list items",
                    total: "what is the total",
                    remove_last: "remove last item",
                    help: "help",
                    stop: "stop listening",
                  };
                  onQuickCommand?.(map[quickSelect]);
                }}
                data-testid="button-run-quick-select"
              >
                Run
              </Button>
            </div>
            <div className="text-xs text-gray-500">Units: kg, packet, box, piece, liter, etc.</div>
          </div>
          {/* Removed long list; dropdown above is the single source */}
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
