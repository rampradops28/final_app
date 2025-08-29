import { useAuth } from "@/hooks/UseAuth";
import { useBilling } from "@/hooks/UseBilling";
import { useVoiceRecognition } from "@/hooks/UseVoiceRecognition";
import { handleVoiceCommand } from "@/lib/ParseVoiceCommand";
import { generateInvoicePDF } from "@/lib/GenerateInvoicePDF";
import { useToast } from "@/hooks/use-toast";
// import LearningAssistant from "../components/LearningAssistant";
// import SMSIntegration from "../components/SMSIntegration";
import VoiceSetupGuide from "../components/VoiceSetupGuide";
import ManualInputPanel from "../components/ManualInputPanel";
// import VoiceTestButton from "../components/VoiceAuthentication";
import VoiceControlPanel from "../components/VoiceControlPanel";
import BillingInterface from "../components/BillingInterface";
import { Button } from "@/components/ui/button";
import { LogOut, Mic, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function DashboardPage() {
  const { user, sessionId, logout } = useAuth();
  const [customerPhone, setCustomerPhone] = useState("");
  const [showVoiceGuide, setShowVoiceGuide] = useState(false);
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(false);
  const { toast } = useToast();

  const billing = useBilling(user?.id || "", sessionId || "");

  // ------------------------------
  // FIX: Define voice first
  // ------------------------------
  const voice = useVoiceRecognition((command) => {
    if (!user?.id || !sessionId) return;

    const context = {
      addItem: billing.addItem,
      removeItem: billing.removeItem,
      clearBill: billing.clearBill,
      totalAmount: billing.totalAmount,
      billItems: billing.billItems,
      generateInvoice: handleGenerateInvoice,
      stopListening: voice.stopListening, // ✅ now safe
    };

    handleVoiceCommand(command, context, {
      voiceFeedback: voiceFeedbackEnabled,
    });
  });

  const handleGenerateInvoice = () => {
    if (billing.billItems.length === 0) {
      toast({
        title: "No Items",
        description: "Add items to generate invoice",
        variant: "destructive",
      });
      return;
    }

    try {
      generateInvoicePDF({
        billItems: billing.billItems,
        totalAmount: billing.totalAmount,
        customerPhone: customerPhone || undefined,
      });

      if (customerPhone) {
        billing.updateBill(customerPhone);
      }

      toast({
        title: "PDF Generated",
        description: "Invoice downloaded successfully",
      });

      // If you still want SMS integration, define this state
      // setShowSMSIntegration(true);
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Could not generate PDF",
        variant: "destructive",
      });
    }
  };

  // Allow dashboard to render even if not authenticated (guest mode)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/80 supports-[backdrop-filter]:bg-surface/60 backdrop-blur border-b border-border">
        <div className="mobile-shell py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Mic className="text-white text-lg w-5 h-5" />
              </div>
              <div>
                <h1
                  className="text-xl font-bold text-gray-900"
                  data-testid="text-app-title"
                >
                  VoiceBill Pro
                </h1>
                <p
                  className="text-sm text-gray-500"
                  data-testid="text-welcome-message"
                >
                  Welcome, {user?.name || "Guest"}
                </p>
              </div>
            </div>

            {/* Voice Status Indicator */}
            <div
              className="flex items-center space-x-2"
              data-testid="voice-status-indicator"
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  voice.isListening ? "bg-success animate-pulse" : "bg-gray-400"
                }`}
              ></div>
              <span className="text-sm text-gray-600">
                {voice.isListening ? "Listening..." : "Voice Inactive"}
              </span>
            </div>

            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mobile-shell py-5 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Voice Control Panel */}
          <div className="lg:col-span-1 space-y-4">
            <VoiceControlPanel
              isListening={voice.isListening}
              isSupported={voice.isSupported}
              lastCommand={voice.lastCommand}
              onToggleListening={voice.toggleListening}
              onLanguageChange={(lang) => {
                voice.setLanguage(lang);
                toast({
                  title: "Language Updated",
                  description: `Voice recognition language changed to ${
                    lang === "en-US" ? "English" : lang === "ta-IN" ? "Tamil" : "Mixed"
                  }`,
                });
              }}
              onVoiceFeedbackChange={setVoiceFeedbackEnabled}
              voiceFeedbackEnabled={voiceFeedbackEnabled}
            />

            {!voice.isSupported && !showVoiceGuide && (
              <Button
                onClick={() => setShowVoiceGuide(true)}
                variant="outline"
                className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                data-testid="button-show-voice-guide"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Voice Setup Help
              </Button>
            )}

            {showVoiceGuide && (
              <VoiceSetupGuide onDismiss={() => setShowVoiceGuide(false)} />
            )}

            {/* Manual Input Panel */}
            <div className="space-y-2">
              <ManualInputPanel
                onCommand={(cmd) =>
                  handleVoiceCommand(cmd, {
                    addItem: billing.addItem,
                    removeItem: billing.removeItem,
                    clearBill: billing.clearBill,
                    totalAmount: billing.totalAmount,
                    billItems: billing.billItems,
                    generateInvoice: handleGenerateInvoice,
                    stopListening: voice.stopListening,
                  })
                }
              />
            </div>
          </div>

          {/* Billing Interface */}
          <div className="lg:col-span-2">
            <BillingInterface
              billItems={billing.billItems}
              totalAmount={billing.totalAmount}
              isLoading={billing.isLoading}
              onRemoveItem={billing.removeItem}
              onResetBill={billing.clearBill}
              onGenerateInvoice={handleGenerateInvoice}
              customerPhone={customerPhone}
              onCustomerPhoneChange={setCustomerPhone}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
