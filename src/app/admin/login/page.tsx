"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed. Please check your credentials.");
      }

      // If MFA required, redirect to MFA challenge page
      if (data.data.mfa_required) {
        sessionStorage.setItem("mfa_challenge_token", data.data.challenge_token);
        sessionStorage.setItem("mfa_email", data.data.profile.email);
        router.push(`/admin/mfa?challenge=${encodeURIComponent(data.data.challenge_token)}`);
        return;
      }

      // Direct login successful
      router.push("/admin");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#6b1426] text-[#dfb15b] flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#b8860b]">
            Internal Backoffice
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#4a1220]">
            Staff Portal Login
          </h1>
          <p className="text-xs text-stone-500">
            Authorized Madhus Boutique staff only. Protected by RBAC & MFA.
          </p>
        </div>

        {/* Login Card */}
        <div className="p-8 rounded-3xl bg-white border border-[#e7dfd5] shadow-xs space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                Staff Email Address
              </label>
              <Input
                type="email"
                required
                placeholder="admin@madhusboutique.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-stone-400" />
                Password
              </label>
              <Input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-xs font-semibold flex items-center justify-center gap-2"
            >
              {isLoading ? "Authenticating..." : "Sign In to Console"}
              <ArrowRight className="w-4 h-4 text-[#dfb15b]" />
            </Button>
          </form>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-stone-500 hover:text-[#6b1426] transition-colors"
          >
            ← Return to Public Boutique Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
