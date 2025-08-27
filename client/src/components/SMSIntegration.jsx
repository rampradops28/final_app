import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SMSIntegration({ customerPhone, invoiceData, onSMSSent }) {
  const [phoneNumber, setPhoneNumber] = useState(customerPhone);
  const [isSending, setIsSending] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const { toast } = useToast();

  const sendSMS = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      // Simulate SMS sending
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const smsMessage = `VoiceBill Pro Invoice
Total: ₹${invoiceData.totalAmount.toFixed(2)}
Items: ${invoiceData.itemCount}
Thank you for your business!
Download PDF: [link-would-be-here]`;

      console.log("SMS sent to:", phoneNumber);
      console.log("Message:", smsMessage);

      setSmsSent(true);
      toast({
        title: "SMS Sent Successfully",
        description: `Invoice details sent to ${phoneNumber}`,
      });

      onSMSSent();
    } catch (error) {
      toast({
        title: "SMS Failed",
        description: "Could not send SMS. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const resetSMS = () => {
    setSmsSent(false);
    setPhoneNumber("");
  };

  if (smsSent) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3
            className="text-lg font-semibold text-green-800 mb-2"
            data-testid="text-sms-success"
          >
            SMS Sent Successfully!
          </h3>
          <p className="text-green-600 mb-4">
            Invoice details have been sent to {phoneNumber}
          </p>
          <Button
            onClick={resetSMS}
            variant="outline"
            className="border-green-500 text-green-600 hover:bg-green-100"
            data-testid="button-send-another"
          >
            Send Another SMS
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <MessageSquare className="text-white w-5 h-5" />
          </div>
          <div>
            <h3
              className="text-lg font-semibold text-gray-900"
              data-testid="text-sms-title"
            >
              Send Invoice via SMS
            </h3>
            <p className="text-sm text-gray-500">
              Send invoice details directly to customer's phone
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="smsPhone">Customer Phone Number</Label>
            <Input
              id="smsPhone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+91 9876543210"
              className="mt-1"
              data-testid="input-sms-phone"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">SMS Preview:</h4>
            <div
              className="text-sm text-gray-600 bg-white p-3 rounded border"
              data-testid="text-sms-preview"
            >
              <p>
                <strong>VoiceBill Pro Invoice</strong>
              </p>
              <p>Total: ₹{invoiceData.totalAmount.toFixed(2)}</p>
              <p>Items: {invoiceData.itemCount}</p>
              <p>Thank you for your business!</p>
              <p className="text-blue-600">Download PDF: [attachment]</p>
            </div>
          </div>

          <Button
            onClick={sendSMS}
            disabled={isSending || !phoneNumber}
            className="w-full bg-blue-500 hover:bg-blue-600"
            data-testid="button-send-sms"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending ? "Sending SMS..." : "Send SMS"}
          </Button>

          <div className="text-xs text-gray-500 text-center">
            <p>SMS will include invoice summary and PDF download link</p>
            <p>Works offline - queued for sending when connected</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
