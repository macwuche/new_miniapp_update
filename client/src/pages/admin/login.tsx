import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [_, setLocation] = useLocation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { toast } = useToast();

  const onSubmit = async (data: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (data.email === "admin@admin.com" && data.password === "123456789") {
      toast({
        title: "Login Successful",
        description: "Welcome back, Admin.",
      });
      setLocation("/admin/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Invalid credentials provided.",
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 p-4">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2832&auto=format&fit=crop')] opacity-10 bg-cover bg-center pointer-events-none" />
      
      <Card className="w-full max-w-md shadow-2xl border-slate-800 bg-slate-950 text-white relative z-10">
        <CardHeader className="space-y-1 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-900/50">
            <ShieldCheck size={32} />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Admin Portal</CardTitle>
          <CardDescription className="text-slate-400">
            Secure access for system administrators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email"
                {...register("email", { required: true })} 
                placeholder="admin@admin.com" 
                className="bg-slate-900 border-slate-800 focus:border-blue-600 text-white placeholder:text-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                {...register("password", { required: true })} 
                placeholder="••••••••" 
                className="bg-slate-900 border-slate-800 focus:border-blue-600 text-white placeholder:text-slate-600"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 text-base bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-900/20 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Authenticating..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Protected by enterprise-grade security encryption.
              <br />
              Unauthorized access is strictly prohibited.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
