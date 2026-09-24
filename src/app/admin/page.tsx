"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  LogOut,
  Users,
  CreditCard,
  Package,
  FileText,
  QrCode,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteSettingsManager } from "@/components/admin/SiteSettingsManager";

interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  role: "SUPER_ADMIN" | "ORDER_MANAGER" | "CONTENT_MANAGER";
  permissions: string[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("orders");

  useEffect(() => {
    fetch("/api/admin/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        if (data.success && data.data) {
          setProfile(data.data);
          // Set initial default tab based on role
          if (data.data.role === "CONTENT_MANAGER") {
            setActiveTab("products");
          } else {
            setActiveTab("orders");
          }
        }
      })
      .catch(() => {
        router.push("/admin/login");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-stone-500">
        Loading administrative console...
      </div>
    );
  }

  if (!profile) return null;

  const isSuperAdmin = profile.role === "SUPER_ADMIN";
  const canManageOrders = profile.permissions.includes("manage:orders");
  const canManageProducts = profile.permissions.includes("manage:products");
  const canManageQr = profile.permissions.includes("manage:payment_qr");
  const canManageAdmins = profile.permissions.includes("manage:admins");
  const canViewAudit = profile.permissions.includes("view:audit_logs");
  const canManageSiteSettings = profile.permissions.includes("manage:site_settings");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner & Profile Bar */}
      <div className="p-6 rounded-3xl bg-white border border-[#e7dfd5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#6b1426] text-[#dfb15b] flex items-center justify-center font-bold font-serif text-lg shadow-sm shrink-0">
            {profile.full_name[0] || "A"}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl font-bold text-[#4a1220]">
                {profile.full_name}
              </h1>
              <Badge
                variant={isSuperAdmin ? "gold" : "default"}
                className="text-[10px] uppercase font-bold"
              >
                {profile.role.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-xs text-stone-500 font-mono">{profile.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href="/" target="_blank">
              View Storefront
            </Link>
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Role Permission Matrix Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-2">
        {canManageOrders && (
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "orders"
                ? "bg-[#6b1426] text-white shadow-sm"
                : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Orders & Payment Verification
          </button>
        )}

        {canManageProducts && (
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "products"
                ? "bg-[#6b1426] text-white shadow-sm"
                : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
            }`}
          >
            <Package className="w-4 h-4" />
            Product Catalog Management
          </button>
        )}

        {canManageQr && (
          <button
            onClick={() => setActiveTab("payment-settings")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "payment-settings"
                ? "bg-[#6b1426] text-white shadow-sm"
                : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
            }`}
          >
            <QrCode className="w-4 h-4" />
            Payment QR & Settings
            <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold">
              SUPER
            </span>
          </button>
        )}

        {canManageAdmins && (
          <button
            onClick={() => setActiveTab("admins")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "admins"
                ? "bg-[#6b1426] text-white shadow-sm"
                : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
            }`}
          >
            <Users className="w-4 h-4" />
            Staff & Permissions
            <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold">
              SUPER
            </span>
          </button>
        )}

        {canViewAudit && (
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "audit"
                ? "bg-[#6b1426] text-white shadow-sm"
                : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            Immutable Audit Trail
            <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold">
              SUPER
            </span>
          </button>
        )}

        {canManageSiteSettings && (
          <button
            onClick={() => setActiveTab("site-settings")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "site-settings"
                ? "bg-[#6b1426] text-white shadow-sm"
                : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
            }`}
          >
            <Palette className="w-4 h-4" />
            Store Settings &amp; Theme CMS
          </button>
        )}
      </div>

      {/* Tab Panels */}
      <div className="p-8 rounded-3xl bg-white border border-[#e7dfd5] shadow-xs min-h-[400px]">
        {activeTab === "orders" && canManageOrders && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#4a1220]">
                  Orders & Payment Verification Queue
                </h2>
                <p className="text-xs text-stone-500">
                  Review submitted customer UTR references and verify bank receipts.
                </p>
              </div>
              <Badge variant="default" className="text-xs">
                Role: {profile.role} Authorized
              </Badge>
            </div>

            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Server-Side Authorization Enforced
              </div>
              <p className="text-xs text-stone-600">
                All verification actions send requests to{" "}
                <code className="bg-stone-200 px-1 py-0.5 rounded font-mono">
                  POST /api/admin/payments/verify
                </code>
                . Only <strong className="text-stone-800">SUPER_ADMIN</strong> and{" "}
                <strong className="text-stone-800">ORDER_MANAGER</strong> can approve payments.
              </p>
            </div>
          </div>
        )}

        {activeTab === "products" && canManageProducts && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#4a1220]">
                  Embroidery Product Catalog
                </h2>
                <p className="text-xs text-stone-500">
                  Manage embroidery designs, machine file keys, stitch counts, and pricing.
                </p>
              </div>
              <Badge variant="default" className="text-xs">
                Role: {profile.role} Authorized
              </Badge>
            </div>
            <p className="text-xs text-stone-600">
              Content Managers and Super Admins have permission to upload design files (.DST, .PES)
              and update product listings.
            </p>
          </div>
        )}

        {activeTab === "payment-settings" && canManageQr && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#4a1220]">
                  Payment Settings & Active UPI QR
                </h2>
                <p className="text-xs text-stone-500">
                  Restricted to Super Administrators. Modifications require elevated step-up authentication.
                </p>
              </div>
              <Badge variant="gold" className="text-xs">
                SUPER_ADMIN ONLY
              </Badge>
            </div>
            <p className="text-xs text-stone-600">
              Any changes to the active merchant UPI ID or private S3 QR code generate an immutable audit log record.
            </p>
          </div>
        )}

        {activeTab === "admins" && canManageAdmins && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#4a1220]">
                  Staff Accounts & Role Assignment
                </h2>
                <p className="text-xs text-stone-500">
                  Manage administrator accounts, assign RBAC roles, and enforce MFA.
                </p>
              </div>
              <Badge variant="gold" className="text-xs">
                SUPER_ADMIN ONLY
              </Badge>
            </div>
            <p className="text-xs text-stone-600">
              Super Admins can create staff accounts and adjust roles (ORDER_MANAGER, CONTENT_MANAGER, SUPER_ADMIN).
            </p>
          </div>
        )}

        {activeTab === "audit" && canViewAudit && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#4a1220]">
                  Immutable Administrative Audit Trail
                </h2>
                <p className="text-xs text-stone-500">
                  Tamper-evident log of all logins, payment verifications, and settings changes.
                </p>
              </div>
              <Badge variant="gold" className="text-xs">
                SUPER_ADMIN ONLY
              </Badge>
            </div>
            <p className="text-xs text-stone-600">
              All events are logged with the executing admin user ID, IP address, user agent, and timestamp.
            </p>
          </div>
        )}

        {activeTab === "site-settings" && canManageSiteSettings && (
          <SiteSettingsManager />
        )}
      </div>
    </div>
  );
}
