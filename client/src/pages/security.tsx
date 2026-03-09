import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Mail, CheckCircle2, AlertTriangle, Lock, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTelegram } from "@/lib/telegram-mock";
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
  const { user } = useTelegram();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"loading" | "email" | "verify" | "verified">("loading");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(0);

  const { data: dbUser } = useQuery({
    queryKey: ['/api/users/register', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: user?.id?.toString() || "123456789",
          username: user?.username || 'alextrader',
          firstName: user?.first_name || 'Alex',
          lastName: user?.last_name || 'Trader',
          profilePicture: user?.photo_url || null
        })
      });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: true,
  });

  const { data: verifiedEmail, isLoading: isLoadingEmail } = useQuery({
    queryKey: ['/api/users/verified-email', dbUser?.id],
    queryFn: async () => {
      if (!dbUser?.id) return null;
      const res = await fetch(`/api/users/${dbUser.id}/verified-email`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!dbUser?.id,
  });

  useEffect(() => {
    if (isLoadingEmail) return;
    if (!dbUser) {
      setStep("email");
      return;
    }
    if (verifiedEmail?.verified) {
      setEmail(verifiedEmail.email);
      setStep("verified");
    } else {
      setStep("email");
    }
  }, [verifiedEmail, isLoadingEmail, dbUser]);

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
    if (!dbUser?.id) {
      toast({
        title: "Error",
        description: "User not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch('/api/email/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, userId: dbUser.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send code');
      }
      setStep("verify");
      setTimer(60);
      toast({
        title: "Code Sent",
        description: "Please check your email (and spam folder) for the verification code.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to Send",
        description: error.message || "Could not send verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
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
    try {
      const res = await fetch('/api/email/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp, userId: dbUser?.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }
      queryClient.invalidateQueries({ queryKey: ['/api/users/verified-email', dbUser?.id] });
      setStep("verified");
      setShowSuccessDialog(true);
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "The code you entered is incorrect. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (timer > 0 || !dbUser?.id) return;
    setIsSending(true);
    try {
      const res = await fetch('/api/email/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, userId: dbUser.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }
      setTimer(60);
      toast({
        title: "Code Resent",
        description: "A new verification code has been sent to your email.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to Resend",
        description: error.message || "Could not resend code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to change your verified email? This will require re-verification.")) {
      setStep("email");
      setEmail("");
      setOtp("");
    }
  };

  return (
    <MobileLayout>
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-security-title">Security</h1>
      </div>
      
      <div className="px-4 space-y-6 pb-24">
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

        {step === "loading" && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

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
                    <Mail className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={18} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      data-testid="input-email"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isSending}
                  data-testid="button-send-code"
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
                We sent a 6-digit code to <span className="font-medium text-gray-900 dark:text-white">{email}</span>. 
                Check your spam folder if you don't see it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center py-4">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  data-testid="input-otp"
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
                data-testid="button-verify-code"
              >
                {isVerifying ? "Verifying..." : "Submit Code"}
              </Button>

              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendCode}
                  disabled={timer > 0 || isSending}
                  className="text-gray-500 dark:text-gray-400"
                  data-testid="button-resend-code"
                >
                  {timer > 0 ? `Resend code in ${timer}s` : "Resend Code"}
                </Button>
              </div>
              
              <Button 
                variant="link" 
                className="w-full text-gray-400 dark:text-gray-500 h-auto p-0"
                onClick={() => setStep("email")}
                data-testid="button-change-email"
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
                <h3 className="text-xl font-bold text-green-900" data-testid="text-verified-status">Email Verified</h3>
                <p className="text-green-700 mt-1" data-testid="text-verified-email">{email}</p>
              </div>
              <p className="text-sm text-green-600/80 max-w-xs">
                Your account is secured. You will receive notifications for any suspicious activity.
              </p>
              
              <div className="w-full pt-4 border-t border-green-100 mt-4">
                <Button 
                  variant="outline" 
                  className="w-full border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
                  onClick={handleReset}
                  data-testid="button-change-verified-email"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Change Email
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          <h3 className="font-bold text-gray-900 dark:text-white px-1">Advanced Security</h3>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between opacity-60">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Login Alerts</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Enabled by default</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" disabled>Manage</Button>
          </div>
        </div>

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
                data-testid="button-success-understood"
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
