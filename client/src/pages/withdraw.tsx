import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { LogOut, ArrowLeft } from "lucide-react";

export default function Withdraw() {
  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 flex flex-col p-6 pb-24">
        <div className="mb-8 pt-2">
          <div 
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer shadow-sm transition-colors"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={20} />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center -mt-20">
          <div className="w-24 h-24 bg-blue-400 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-blue-200">
            <LogOut className="text-white" size={40} strokeWidth={2.5} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">
            You're almost ready to withdraw!
          </h1>

        <p className="text-gray-500 text-sm max-w-xs mx-auto mb-10 leading-relaxed">
          To make a withdraw, please add a withdraw account from your profile (withdraw accounts).
        </p>

        <div className="w-full max-w-xs space-y-6">
          <Link href="/withdraw/accounts">
            <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base shadow-lg shadow-blue-600/20">
              Add Withdraw Account
            </Button>
          </Link>

          <Link href="/">
            <button className="text-blue-600 font-bold text-sm hover:text-blue-700 transition-colors">
              Go to Dashboard
            </button>
          </Link>
        </div>
        </div>

        <div className="absolute bottom-24 left-0 right-0 text-center px-6">
          <p className="text-xs text-gray-400">
            Please feel free to contact us if you have any question.
          </p>
        </div>

      </div>
    </MobileLayout>
  );
}
