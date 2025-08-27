import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Shield, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VoiceAuthentication({ onAuthSuccess, onAuthFailed }) {
  const [isRecording, setIsRecording] = useState(false);
  const [authStatus, setAuthStatus] = useState("idle"); // "idle" | "recording" | "processing" | "success" | "failed"
  const { toast } = useToast();

  const startVoiceAuth = async () => {
    setIsRecording(true);
    setAuthStatus("recording");

    try {
      // Simulate voice recording and authentication
      await new Promise((resolve) => setTimeout(resolve, 3000));

      setAuthStatus("processing");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate voice matching (70% success rate for demo)
      const isAuthenticated = Math.random() > 0.3;

      if (isAuthenticated) {
        setAuthStatus("success");
        toast({
          title: "Voice Authentication Successful",
          description: "Welcome! Your voice has been verified.",
        });
        setTimeout(() => onAuthSuccess(), 1000);
      } else {
        setAuthStatus("failed");
        toast({
          title: "Voice Authentication Failed",
          description: "Voice not recognized. Please try again.",
          variant: "destructive",
        });
        setTimeout(() => {
          setAuthStatus("idle");
          onAuthFailed();
        }, 2000);
      }
    } catch (error) {
      setAuthStatus("failed");
      toast({
        title: "Authentication Error",
        description: "Failed to process voice authentication",
        variant: "destructive",
      });
    } finally {
      setIsRecording(false);
    }
  };

  const getStatusIcon = () => {
    switch (authStatus) {
      case "recording":
        return <Mic className="w-8 h-8 text-blue-500 animate-pulse" />;
      case "processing":
        return <Shield className="w-8 h-8 text-yellow-500 animate-spin" />;
      case "success":
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case "failed":
        return <XCircle className="w-8 h-8 text-red-500" />;
      default:
        return <Shield className="w-8 h-8 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (authStatus) {
      case "recording":
        return "Speak naturally for 3 seconds...";
      case "processing":
        return "Analyzing voice patterns...";
      case "success":
        return "Voice authenticated successfully!";
      case "failed":
        return "Voice authentication failed";
      default:
        return "Tap to authenticate with your voice";
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardContent className="pt-8 pb-8 px-8">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            {getStatusIcon()}
          </div>

          <h2
            className="text-2xl font-bold text-gray-900 mb-2"
            data-testid="text-voice-auth-title"
          >
            Voice Authentication
          </h2>

          <p
            className="text-gray-600 mb-8"
            data-testid="text-voice-auth-status"
          >
            {getStatusText()}
          </p>

          <Button
            onClick={startVoiceAuth}
            disabled={isRecording || authStatus === "processing"}
            className={`w-full py-3 text-lg shadow-lg ${
              authStatus === "success"
                ? "bg-green-500 hover:bg-green-600"
                : authStatus === "failed"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-primary hover:bg-blue-700"
            }`}
            data-testid="button-voice-auth"
          >
            {authStatus === "idle"
              ? "Start Voice Authentication"
              : authStatus === "recording"
              ? "Recording..."
              : authStatus === "processing"
              ? "Processing..."
              : authStatus === "success"
              ? "Authenticated!"
              : "Try Again"}
          </Button>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">Security Note:</p>
            <p className="text-xs text-blue-600 mt-1">
              Your voice is analyzed using MFCC features for secure biometric
              authentication
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
