import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { AlertCircle, Chrome, Mic, Shield } from "lucide-react";

export default function VoiceSetupGuide({ onDismiss }) {
  const testVoiceRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech Recognition not available. Please use Chrome or Edge browser."
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.start();

    recognition.onresult = () => {
      alert("Voice recognition is working! You can now use voice commands.");
      onDismiss();
    };

    recognition.onerror = (event) => {
      alert(
        `Voice recognition error: ${event.error}. Please check browser settings.`
      );
    };
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-orange-500 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-orange-800 mb-3">
              Voice Recognition Setup Required
            </h3>

            <div className="space-y-4 text-sm text-orange-700">
              <div className="flex items-center space-x-2">
                <Chrome className="w-4 h-4" />
                <span>
                  <strong>Browser:</strong> Use Chrome, Edge, or Safari (latest
                  versions)
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Mic className="w-4 h-4" />
                <span>
                  <strong>Microphone:</strong> Allow microphone access when
                  prompted
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>
                  <strong>HTTPS:</strong> Voice recognition works best on secure
                  connections
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded border border-orange-200">
              <h4 className="font-medium text-orange-800 mb-2">
                How to Enable Microphone:
              </h4>
              <ol className="text-sm text-orange-700 space-y-1">
                <li>
                  1. Look for the microphone icon 🎤 in your browser's address
                  bar
                </li>
                <li>2. Click it and select "Allow" for microphone access</li>
                <li>
                  3. If no icon appears, check browser settings → Privacy →
                  Microphone
                </li>
                <li>4. Refresh the page and try again</li>
              </ol>
            </div>

            <div className="flex space-x-3 mt-4">
              <Button
                onClick={testVoiceRecognition}
                className="bg-orange-500 hover:bg-orange-600 text-white"
                data-testid="button-test-voice"
              >
                <Mic className="w-4 h-4 mr-2" />
                Test Voice Recognition
              </Button>

              <Button
                onClick={onDismiss}
                variant="outline"
                className="border-orange-500 text-orange-600 hover:bg-orange-100"
                data-testid="button-dismiss-guide"
              >
                I'll Set It Up Later
              </Button>
            </div>

            <div className="mt-4 text-xs text-orange-600">
              <p>
                <strong>Alternative:</strong> You can still use the app with
                manual input if voice recognition isn't available.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
