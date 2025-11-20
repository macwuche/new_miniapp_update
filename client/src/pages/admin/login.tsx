import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LockKeyhole } from "lucide-react";

export default function AdminLogin() {
  const [_, setLocation] = useLocation();
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    // Mock login for prototype
    if (data.username === "admin" && data.password === "admin") {
      setLocation("/admin/dashboard");
    } else {
      alert("Invalid credentials (try admin/admin)");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
            <LockKeyhole size={24} />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
          <CardDescription>
            Enter your credentials to access the brokerage dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...register("username")} placeholder="admin" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} placeholder="••••••" />
            </div>
            <Button type="submit" className="w-full h-11 text-base">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
