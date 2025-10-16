// src/components/admin/AdminLogin.tsx
"use client";

import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";

// Define props interface
interface AdminLoginProps {
  onLogin: () => void;
}

// Right side image component
function LoginImageSide() {
  return (
    <div className="hidden lg:flex lg:flex-1 relative">
      <Image className="absolute inset-0 h-full w-full object-cover" src="/loginphoto.jpeg" alt="Photography Studio" height={1000} width={1000} />
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-black/20 backdrop-blur-sm text-center px-4 py-2">
          <p className="text-white text-sm">made by ElVora</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRequestPassword, setShowRequestPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // --- Login handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Login failed");

      toast.success("Login successful! Redirecting...");

      // Call the onLogin prop to update parent state
      onLogin();

      // Optional: You can also reload or redirect here
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Reset Password Handler ---
  const handleRequestPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingReset(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      toast.success("A new password has been sent to your email.");
      setShowRequestPassword(false);
      setResetEmail("");
    } catch (err) {
      // Only log unexpected errors (non-API response errors)
      if (err instanceof Error && !err.message.includes("Failed to reset password") && !err.message.includes("Email does not match")) {
        console.error("Unexpected password reset error:", err);
      }
      toast.error((err as Error).message || "Failed to reset password");
    } finally {
      setIsSendingReset(false);
    }
  };

  // ===============================
  // Request Password Screen
  // ===============================
  if (showRequestPassword) {
    return (
      <div className="flex min-h-screen">
        <div className="flex flex-1 flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-thin tracking-wider text-foreground">REQUEST PASSWORD</h2>
              <p className="mt-2 text-sm text-muted-foreground">Enter your email to receive your password.</p>
            </div>

            <form onSubmit={handleRequestPassword} className="mt-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reset-email" className="sr-only">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="pl-10"
                      placeholder="Email address"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button type="submit" className="w-full" disabled={isSendingReset || !resetEmail}>
                  {isSendingReset ? "Sending..." : "Send Password"}
                </Button>

                <Button type="button" variant="ghost" className="w-full" onClick={() => setShowRequestPassword(false)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Button>
              </div>
            </form>
          </div>
        </div>

        <LoginImageSide />
      </div>
    );
  }

  // ===============================
  // Login Screen
  // ===============================
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-thin tracking-wider text-foreground">ADMIN PANEL</h2>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to manage your photography portfolio</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="sr-only">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Email"
                  value={credentials.email}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="password" className="sr-only">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="pr-10"
                    placeholder="Password"
                    value={credentials.password}
                    onChange={handleInputChange}
                  />
                  <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button type="button" className="text-sm text-primary hover:underline" onClick={() => setShowRequestPassword(true)}>
                Request password?
              </button>
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={isLoading || !credentials.email || !credentials.password}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <LoginImageSide />
    </div>
  );
}
