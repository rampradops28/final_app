import { useAuth } from "@/hooks/UseAuth";
import { useBilling } from "@/hooks/UseBilling";
import { useVoiceRecognition } from "@/hooks/UseVoiceRecognition";
import { handleVoiceCommand } from "@/lib/ParseVoiceCommand";
import { generateInvoicePDF, generateInvoicePDFAndGetDataUrl } from "@/lib/GenerateInvoicePDF";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/AlertDialog";
import { useToast } from "@/hooks/use-toast";
// import LearningAssistant from "../components/LearningAssistant";
// import SMSIntegration from "../components/SMSIntegration";
import VoiceSetupGuide from "../components/VoiceSetupGuide";
import VoiceAuthentication from "../components/VoiceAuthentication";
import { useVoiceAuth } from "@/hooks/UseVoiceAuth";
import ManualInputPanel from "../components/ManualInputPanel";
// import VoiceTestButton from "../components/VoiceAuthentication";
import VoiceControlPanel from "../components/VoiceControlPanel";
import BillingInterface from "../components/BillingInterface";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LogOut, Mic, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { speakText, stopSpeaking } from "@/lib/SpeechSynthesis";

export default function DashboardPage() {
  const { user, sessionId, logout } = useAuth();
  const [customerPhone, setCustomerPhone] = useState("");
  const [showVoiceGuide, setShowVoiceGuide] = useState(false);
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(false);
  const { toast } = useToast();
  const { isInstallable, installed, promptInstall } = usePWAInstall();
  const voiceAuth = useVoiceAuth();

  // Voice auth requirement toggle (persisted)
  const [requireVoiceAuth, setRequireVoiceAuth] = useState(true);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("__voice_auth_required__");
      setRequireVoiceAuth(raw === null ? true : raw === "1");
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("__voice_auth_required__", requireVoiceAuth ? "1" : "0"); } catch {}
    // If turning off requirement, unlock immediately for this session
    if (!requireVoiceAuth) {
      voiceAuth.markVerified(true);
    } else {
      // Turning back ON should force fresh verification
      voiceAuth.resetVerification();
    }
  }, [requireVoiceAuth]);

  const billing = useBilling(user?.id || "", sessionId || "");

  // Invoice dialog state
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [invoicePreview, setInvoicePreview] = useState(null); // { fileName, dataUrl, total, items }
  const [isSendingSms, setIsSendingSms] = useState(false);

  // Helper to mask phone for user-friendly messages
  const maskPhone = (phone) => {
    if (!phone) return "(unknown)";
    const digits = String(phone).replace(/\D/g, "");
    if (digits.length < 4) return phone;
    const last2 = digits.slice(-2);
    const prefix = String(phone).slice(0, 3);
    return `${prefix}***-**${last2}`;
  };

  // ------------------------------
  // FIX: Define voice first
  // ------------------------------
  const voice = useVoiceRecognition((command) => {
    // Gate by voice auth only if required
    if (requireVoiceAuth && !voiceAuth.isVerified) {
      const ok = voiceAuth.verifyFromCommand(command)
      if (!ok) {
        toast({ title: "Voice not recognized", description: "Say your enrolled name to unlock commands", variant: "destructive" })
        return
      }
    }

    const context = {
      addItem: billing.addItem,
      removeItem: billing.removeItem,
      clearBill: billing.clearBill,
      totalAmount: billing.totalAmount,
      billItems: billing.billItems,
      generateInvoice: handleGenerateInvoice,
      stopListening: voice.stopListening, // ✅ now safe
      toast,
    };

    handleVoiceCommand(command, context, {
      voiceFeedback: voiceFeedbackEnabled,
      languageMode: voice.currentLanguage,
    });
  });

  // Quick command runner for UI buttons in VoiceControlPanel
  const runQuickCommand = (cmd) => {
    const context = {
      addItem: billing.addItem,
      removeItem: billing.removeItem,
      clearBill: billing.clearBill,
      totalAmount: billing.totalAmount,
      billItems: billing.billItems,
      generateInvoice: handleGenerateInvoice,
      stopListening: voice.stopListening,
      toast,
    };
    handleVoiceCommand(cmd, context, {
      voiceFeedback: voiceFeedbackEnabled,
      languageMode: voice.currentLanguage,
    });
  };

  // Reset bill automatically when mic is toggled off (explicit stop)
  useEffect(() => {
    if (!voice.isListening) {
      // Avoid clearing when initially loading or when bill is already empty
      if ((billing.billItems?.length || 0) > 0) {
        billing.clearBill();
      }
      stopSpeaking();
    }
  }, [voice.isListening]);

  // Speak bill summary when voice feedback is toggled ON; stop when toggled OFF
  const prevVoiceFeedbackRef = useRef(voiceFeedbackEnabled);
  useEffect(() => {
    const prev = prevVoiceFeedbackRef.current;
    if (!prev && voiceFeedbackEnabled) {
      // Just enabled: speak current bill summary once
      try {
        const items = billing.billItems || [];
        if (items.length === 0) {
          speakText("Your order is empty.");
        } else {
          const parts = items.slice(0, 5).map((it, idx) => {
            const name = it?.name ?? "item";
            const qty = it?.quantity ?? "1";
            const rate = typeof it?.rate === "number" ? it.rate : Number(it?.rate) || 0;
            return `${idx + 1}) ${qty} ${name} at ₹${rate}`;
          });
          const more = items.length > 5 ? ` and ${items.length - 5} more items` : "";
          const total = typeof billing.totalAmount === "number" ? billing.totalAmount : Number(billing.totalAmount) || 0;
          speakText(`You now have ${items.length} ${items.length === 1 ? "item" : "items"}: ${parts.join(", ")}${more}. Total is ₹${total.toFixed(2)}.`);
        }
      } catch (_) {
        // no-op
      }
    } else if (prev && !voiceFeedbackEnabled) {
      // Just disabled: stop speaking
      stopSpeaking();
    }
    prevVoiceFeedbackRef.current = voiceFeedbackEnabled;
    // Only react to toggling; do not add billing deps to avoid repeated reads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceFeedbackEnabled]);

  const handleGenerateInvoice = async () => {
    if (billing.billItems.length === 0) {
      toast({
        title: "No Items",
        description: "Add items to generate invoice",
        variant: "destructive",
      });
      return;
    }

    try {
      const { fileName, dataUrl } = await generateInvoicePDFAndGetDataUrl({
        billItems: billing.billItems,
        totalAmount: billing.totalAmount,
        customerPhone: customerPhone || undefined,
      });
      setInvoicePreview({
        fileName,
        dataUrl,
        total: Number(billing.totalAmount) || 0,
        items: billing.billItems,
      });
      setInvoiceDialogOpen(true);

      toast({
        title: "PDF Generated",
        description: "Invoice downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Could not generate PDF",
        variant: "destructive",
      });
    }
  };

  const sendInvoiceSms = async () => {
    if (!invoicePreview || !customerPhone) return;
    setIsSendingSms(true);
    try {
      const res = await apiRequest("POST", "/api/sms/send-invoice", {
        phoneNumber: customerPhone,
        fileName: invoicePreview.fileName,
        fileBase64: invoicePreview.dataUrl,
        message: `Invoice total: ₹${Number(invoicePreview.total).toFixed(2)}`,
      });
      const data = await res.json();
      const masked = maskPhone(customerPhone);
      const sid = data?.messageId ? ` Message ID: ${data.messageId}` : "";
      toast({ title: "SMS Sent", description: `Invoice sent to ${masked}.${sid}` });
      billing.updateBill(customerPhone);
      setInvoiceDialogOpen(false);
    } catch (err) {
      const masked = maskPhone(customerPhone);
      const msg = err?.message || "Unknown error";
      toast({ title: "SMS Failed", description: `Could not send to ${masked}. ${msg}`, variant: "destructive" });
    } finally {
      setIsSendingSms(false);
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

            {/* Voice Auth Requirement Toggle */}
            <div className="hidden md:flex items-center gap-2 mr-2">
              <Switch id="require-voice-auth" checked={requireVoiceAuth} onCheckedChange={setRequireVoiceAuth} />
              <Label htmlFor="require-voice-auth" className="text-sm text-gray-700">Require Voice Auth</Label>
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
          {/* Voice Authentication gate (shown only if required) */}
          {requireVoiceAuth && !voiceAuth.enrolledName && (
            <div className="lg:col-span-3">
              <VoiceAuthentication
                mode="enroll"
                onAuthSuccess={() => {
                  // Prompt to enroll with a name (simple prompt for demo)
                  const name = window.prompt("Enter your name to enroll voice (e.g., Ram)") || ""
                  if (voiceAuth.enroll(name)) {
                    toast({ title: "Voice enrolled", description: `Welcome, ${name}` })
                  } else {
                    toast({ title: "Enrollment failed", description: "Please enter a valid name", variant: "destructive" })
                  }
                }}
                onAuthFailed={() => {
                  toast({ title: "Voice auth failed", description: "Try again" , variant: "destructive"})
                }}
              />
            </div>
          )}
          {/* Voice Control Panel */}
          <div className="lg:col-span-1 space-y-4">
            {voiceAuth.enrolledName && !voiceAuth.isVerified && (
              <Card className="border border-orange-200 bg-orange-50">
                <CardContent className="p-4 text-sm text-orange-800">
                  Say your enrolled name (“{voiceAuth.enrolledName}”) once to unlock voice commands.
                </CardContent>
              </Card>
            )}
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
              onQuickCommand={runQuickCommand}
            />

            {requireVoiceAuth && voiceAuth.enrolledName && !voiceAuth.isVerified && (
              <div className="mt-2">
                <VoiceAuthentication
                  mode="verify"
                  onAuthSuccess={() => voiceAuth.markVerified(true)}
                  onAuthFailed={() => voiceAuth.markVerified(false)}
                />
              </div>
            )}

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
            {/* <div className="space-y-2">
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
            </div> */}

            {/* Available Commands Card */}
            {/* <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-4 space-y-2">
                <h3 className="text-base font-semibold text-gray-900">Available Commands</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>
                    <span className="font-medium">Add</span> — "Add [item] [quantity] [unit] [price]"
                    <div className="text-xs text-gray-500 ml-4">Units: kg, packet, box, piece, liter, etc.</div>
                    <div className="text-xs text-gray-500 ml-4">Examples: Add potato 1 piece 50; Add sugar 2 kg 40</div>
                  </li>
                  <li>
                    <span className="font-medium">Remove</span> — "Remove [item]"
                  </li>
                  <li>
                    <span className="font-medium">Reset bill</span> — "Reset bill"
                  </li>
                  <li>
                    <span className="font-medium">Generate invoice</span> — "Generate invoice"
                  </li>
                </ul>
              </CardContent>
            </Card> */}
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

      {/* In-app Install Prompt (shows when browser signals installable) */}
      {isInstallable && !installed && (
        <div className="fixed inset-x-0 bottom-3 mx-auto w-[92%] md:w-[420px] shadow-lg rounded-xl border border-gray-200 bg-white/95 backdrop-blur p-3 z-50">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-900">Install VoiceBill Pro</div>
              <div className="text-xs text-gray-600">Add to your home screen for faster access.</div>
            </div>
            <Button size="sm" onClick={promptInstall} className="shrink-0">
              Install
            </Button>
          </div>
        </div>
      )}

      {/* Invoice SMS Dialog */}
      <AlertDialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Invoice Ready</AlertDialogTitle>
            <AlertDialogDescription>
              Review the bill and choose to send via SMS.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 max-h-72 overflow-auto">
            <div className="text-sm text-gray-700">
              <div className="font-medium">Items</div>
              <ul className="list-disc list-inside">
                {(invoicePreview?.items || []).map((it, idx) => (
                  <li key={idx}>{String(it.quantity)} × {it.name} @ ₹{Number(it.rate).toFixed(2)} = ₹{Number(it.amount).toFixed(2)}</li>
                ))}
              </ul>
            </div>
            <div className="text-right font-semibold">Total: ₹{Number(invoicePreview?.total || 0).toFixed(2)}</div>
            <div className="text-sm text-gray-600">Phone: {customerPhone || "(enter phone above)"}</div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSendingSms}>Close</AlertDialogCancel>
            <AlertDialogAction disabled={!customerPhone || isSendingSms} onClick={sendInvoiceSms}>
              {isSendingSms ? "Sending…" : "Send SMS"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
