import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Mail, CheckCircle2, AlertTriangle, Lock, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function Security() {
  const { toast } = useToast();
  const [step, setStep] = useState<"email" | "verify" | "verified">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(0);

  // Check for existing verification
  useEffect(() => {
    const savedEmail = localStorage.getItem("verified_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setStep("verified");
    }
  }, []);

  // Timer countdown for resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSending(false);
    
    setStep("verify");
    setTimer(60); // 60 seconds cooldown
    toast({
      title: "Code Sent",
      description: "Please check your email (and spam folder) for the verification code.",
    });
  };

  const handleVerifyCode = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the full 6-digit code.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsVerifying(false);

    if (otp === "123456" || otp.length === 6) { // Accept any 6 digit code for mockup
      localStorage.setItem("verified_email", email);
      setStep("verified");
      setShowSuccessDialog(true);
    } else {
      toast({
        title: "Verification Failed",
        description: "The code you entered is incorrect. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResendCode = () => {
    if (timer > 0) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setTimer(60);
      toast({
        title: "Code Resent",
        description: "A new verification code has been sent to your email.",
      });
    }, 1000);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to change your verified email? This will require re-verification.")) {
      localStorage.removeItem("verified_email");
      setStep("email");
      setEmail("");
      setOtp("");
    }
  };

  return (
    <MobileLayout>
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">Security</h1>
      </div>
      
      <div className="px-4 space-y-6 pb-24">
        {/* Header Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mt-1">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="font-bold text-blue-900">Account Security</h3>
            <p className="text-sm text-blue-700 mt-1 leading-relaxed">
              Verify your email to receive security alerts. Re-verification is required if you change your Telegram username or full name.
            </p>
          </div>
        </div>

        {step === "email" && (
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Email Verification</CardTitle>
              <CardDescription>
                Enter your email address to secure your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isSending}
                >
                  {isSending ? "Sending Code..." : "Verify Email"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "verify" && (
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Enter Verification Code</CardTitle>
              <CardDescription>
                We sent a 6-digit code to <span className="font-medium text-gray-900">{email}</span>. 
                Check your spam folder if you don't see it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center py-4">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button 
                onClick={handleVerifyCode} 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isVerifying || otp.length !== 6}
              >
                {isVerifying ? "Verifying..." : "Submit Code"}
              </Button>

              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendCode}
                  disabled={timer > 0 || isSending}
                  className="text-gray-500"
                >
                  {timer > 0 ? `Resend code in ${timer}s` : "Resend Code"}
                </Button>
              </div>
              
              <Button 
                variant="link" 
                className="w-full text-gray-400 h-auto p-0"
                onClick={() => setStep("email")}
              >
                Change Email
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "verified" && (
          <Card className="border-green-100 bg-green-50/50 shadow-sm">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900">Email Verified</h3>
                <p className="text-green-700 mt-1">{email}</p>
              </div>
              <p className="text-sm text-green-600/80 max-w-xs">
                Your account is secured. You will receive notifications for any suspicious activity.
              </p>
              
              <div className="w-full pt-4 border-t border-green-100 mt-4">
                <Button 
                  variant="outline" 
                  className="w-full border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
                  onClick={handleReset}
                >
                  <RefreshCw size={16} className="mr-2" />
                  Change Email
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Security Settings (Mock) */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900 px-1">Advanced Security</h3>
          
          <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between opacity-60">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 text-gray-500 rounded-lg">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Login Alerts</p>
                <p className="text-xs text-gray-500">Enabled by default</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" disabled>Manage</Button>
          </div>
        </div>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <Shield size={24} />
                Security Activated
              </DialogTitle>
              <DialogDescription className="pt-2">
                Your email has been verified successfully. You will now receive security notifications whenever there is an attempt to access your trading account.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              <Button 
                type="button" 
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                onClick={() => setShowSuccessDialog(false)}
              >
                Understood
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MobileLayout>
  );
}
