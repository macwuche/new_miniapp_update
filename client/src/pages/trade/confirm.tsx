import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function TradeConfirm() {
  const [_, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const handleConfirm = () => {
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Redirect after showing success for a moment
      setTimeout(() => {
        setLocation("/portfolio");
      }, 2000);
    }, 1500);
  };

  const handleCancelConfirm = () => {
    setIsCancelDialogOpen(false);
    setLocation("/");
  };

  return (
    <MobileLayout>
      <div className="bg-gray-50 min-h-screen pb-24">
        <div className="p-6 max-w-lg mx-auto pt-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Your Investment</h2>
            <p className="text-gray-500 text-sm">
              Please review your investment plan details and confirm.
            </p>
          </div>

          <div className="space-y-4">
            {/* Plan Details Card */}
            <Card className="p-5 border-gray-200 shadow-sm bg-white rounded-xl">
              <div className="grid grid-cols-3 gap-4 text-center divide-x divide-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Plan Name</p>
                  <p className="font-bold text-gray-900 text-sm">Mercury</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Duration</p>
                  <p className="font-bold text-gray-900 text-sm">7 Days</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Hourly Profit</p>
                  <p className="font-bold text-gray-900 text-sm">0.25%</p>
                </div>
              </div>
            </Card>

            {/* Financial Details Card */}
            <Card className="border-gray-200 shadow-sm bg-white rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-500">Payment Account</span>
                <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                  <Wallet size={16} className="text-gray-500" />
                  Main Balance
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Amount to Invest</span>
                  <span className="text-sm font-bold text-gray-900">100.00 USD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total Profit Earn</span>
                  <span className="text-sm font-bold text-gray-500">42.00 USD</span>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">Total Return (inc. cap)</span>
                <span className="text-sm font-bold text-gray-900">142.00 USD</span>
              </div>
            </Card>

            {/* Debit Amount Card */}
            <Card className="p-4 border-gray-200 shadow-sm bg-white rounded-xl flex justify-between items-center">
              <span className="font-bold text-gray-900 text-sm">Amount to Debit</span>
              <span className="font-bold text-gray-900 text-base">100.00 USD</span>
            </Card>

            <p className="text-xs text-gray-400 italic">
              * The amount will be deducted immediately from your account balance once you confirm.
            </p>

            <div className="pt-4 space-y-4">
              <Button 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base shadow-lg shadow-blue-600/20"
                onClick={handleConfirm}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm & Procced"
                )}
              </Button>
              
              <button 
                className="w-full text-center text-red-500 font-medium text-sm hover:text-red-600 py-2"
                onClick={() => setIsCancelDialogOpen(true)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={isSuccess} onOpenChange={setIsSuccess}>
        <DialogContent className="sm:max-w-md rounded-2xl w-[90%] bg-white flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Investment Successful!</h3>
          <p className="text-center text-gray-500 text-sm">
            Your investment plan has been activated.
          </p>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent className="rounded-2xl w-[90%] max-w-xs">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-lg">Cancel Investment?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Are you sure if you want to close this investment plan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:justify-center">
            <Button 
              variant="destructive" 
              className="w-full rounded-xl"
              onClick={handleCancelConfirm}
            >
              Yes i want to
            </Button>
            <Button 
              variant="outline" 
              className="w-full rounded-xl mt-0"
              onClick={() => setIsCancelDialogOpen(false)}
            >
              Not now
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MobileLayout>
  );
}
