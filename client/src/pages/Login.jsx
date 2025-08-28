import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/UseAuth";
import { useToast } from "@/hooks/use-toast";
import VoiceAuthentication from "../components/VoiceAuthentication";
import { Mic } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useVoiceAuth, setUseVoiceAuth] = useState(false);
  const [voiceAuthPassed, setVoiceAuthPassed] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(username, password);
      
      if (!result.success) {
        toast({
          title: "Login Failed",
          description: "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome!",
          description: "Login successful",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (useVoiceAuth && !voiceAuthPassed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md">
          <VoiceAuthentication
            onAuthSuccess={() => setVoiceAuthPassed(true)}
            onAuthFailed={() => setUseVoiceAuth(false)}
          />
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => setUseVoiceAuth(false)}
              className="text-sm text-gray-600 hover:bg-accent rounded-xl"
            >
              Use traditional login instead
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md soft-card shadow-sm">
        <CardContent className="pt-8 pb-8 px-5 sm:px-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic className="text-white text-2xl w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">VoiceBill Pro</h1>
            <p className="text-gray-600">Voice-Driven Billing Assistant</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full soft-input"
                data-testid="input-username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full soft-input"
                data-testid="input-password"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full soft-btn py-3 shadow-sm"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-border space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Demo credentials: admin / password123
            </p>
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setUseVoiceAuth(true)}
                className="w-full text-primary border-primary hover:bg-accent rounded-xl"
                data-testid="button-voice-auth-login"
              >
                <Mic className="w-4 h-4 mr-2" />
                Login with Voice Authentication
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
