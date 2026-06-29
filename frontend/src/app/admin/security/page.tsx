"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Shield, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/services/api";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { isAxiosError } from "axios";

function apiErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const msg = err.response?.data?.error?.message;
    if (typeof msg === "string" && msg.trim()) return msg;
    if (err.response?.status === 404) {
      return "2FA setup endpoint not found — deploy the latest backend to Render and redeploy.";
    }
  }
  return fallback;
}

export default function AdminSecurityPage() {
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [setupUrl, setSetupUrl] = useState<string | null>(null);
  const [setupSecret, setSetupSecret] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [confirmCode, setConfirmCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setErrorBanner(null);
    try {
      const res = await api.get("/auth/totp/status");
      const data = res.data?.data ?? res.data;
      const enabled = Boolean(data?.totp_enabled);
      setTotpEnabled(enabled);
    } catch (err) {
      const msg = apiErrorMessage(err, "Could not load 2FA status");
      setErrorBanner(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const startSetup = async () => {
    setBusy(true);
    setErrorBanner(null);
    try {
      const res = await api.post("/auth/totp/setup");
      const data = res.data?.data ?? res.data;
      const url = data?.otpauth_url as string;
      const secret = data?.secret as string;
      setSetupUrl(url);
      setSetupSecret(secret);
      const qr = await QRCode.toDataURL(url, { width: 220, margin: 2 });
      setQrDataUrl(qr);
    } catch (err) {
      const msg = apiErrorMessage(err, "Failed to start 2FA setup");
      setErrorBanner(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const confirmSetup = async () => {
    if (confirmCode.length !== 6) {
      toast.error("Enter the 6-digit code from your app");
      return;
    }
    setBusy(true);
    setErrorBanner(null);
    try {
      await api.post("/auth/totp/confirm", { code: confirmCode });
      toast.success("Two-factor authentication enabled");
      setSetupUrl(null);
      setSetupSecret(null);
      setQrDataUrl(null);
      setConfirmCode("");
      setTotpEnabled(true);
      const cached = localStorage.getItem("mvr_user");
      if (cached) {
        const parsed = JSON.parse(cached) as Record<string, unknown>;
        parsed.totp_enabled = true;
        localStorage.setItem("mvr_user", JSON.stringify(parsed));
      }
    } catch (err) {
      const msg = apiErrorMessage(err, "Invalid code — try again");
      setErrorBanner(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const disableTotp = async () => {
    setBusy(true);
    setErrorBanner(null);
    try {
      await api.post("/auth/totp/disable", {
        password: disablePassword,
        code: disableCode,
      });
      toast.success("Two-factor authentication disabled");
      setDisablePassword("");
      setDisableCode("");
      setTotpEnabled(false);
      const cached = localStorage.getItem("mvr_user");
      if (cached) {
        const parsed = JSON.parse(cached) as Record<string, unknown>;
        parsed.totp_enabled = false;
        localStorage.setItem("mvr_user", JSON.stringify(parsed));
      }
    } catch (err) {
      const msg = apiErrorMessage(err, "Could not disable 2FA — check password and code");
      setErrorBanner(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <Loader2 className="animate-spin mr-2" size={18} />
        Loading security settings…
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#1a2f5e]/10 flex items-center justify-center">
          <Shield className="text-[#1a2f5e]" size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1a2f5e]">Two-Factor Authentication</h2>
          <p className="text-gray-500 text-sm mt-1">
            Protect your admin account with Google Authenticator (or any TOTP app).
          </p>
        </div>
      </div>

      {errorBanner && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 flex gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{errorBanner}</span>
        </div>
      )}

      {!totpEnabled && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>
            Two-factor authentication is recommended for admin accounts. You can enable it below at any time.
            If setup fails, ensure <code className="text-xs bg-amber-100 px-1 rounded">TOTP_ENCRYPTION_KEY</code> is set on Render and the backend has been redeployed.
          </span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-[#1a2f5e]">Status</p>
            <p className="text-sm text-gray-500">
              Signed in as {user?.email ?? "admin"}
            </p>
          </div>
          {totpEnabled ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-xs font-semibold">
              <CheckCircle2 size={14} />
              Enabled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full text-xs font-semibold">
              Not enabled
            </span>
          )}
        </div>

        {!totpEnabled && !setupUrl && (
          <Button onClick={startSetup} disabled={busy} className="bg-[#1a2f5e] hover:bg-[#0f1c3d]">
            {busy ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
            Set up Google Authenticator
          </Button>
        )}

        {setupUrl && (
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Scan this QR code with Google Authenticator, then enter the 6-digit code to confirm.
            </p>
            {qrDataUrl && (
              <div className="flex justify-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <Image src={qrDataUrl} alt="2FA QR code" width={220} height={220} unoptimized />
              </div>
            )}
            {setupSecret && (
              <p className="text-xs text-gray-500 break-all">
                Manual entry key: <code className="bg-gray-100 px-1 rounded">{setupSecret}</code>
              </p>
            )}
            <div className="space-y-1.5 max-w-xs">
              <Label htmlFor="confirm-code">Verification code</Label>
              <Input
                id="confirm-code"
                inputMode="numeric"
                maxLength={6}
                value={confirmCode}
                onChange={(e) =>
                  setConfirmCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                className="text-center tracking-widest"
              />
            </div>
            <Button
              onClick={confirmSetup}
              disabled={busy || confirmCode.length !== 6}
              className="bg-[#c9a84c] hover:bg-[#a07a2e] text-white"
            >
              Confirm & Enable 2FA
            </Button>
          </div>
        )}

        {totpEnabled && (
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <p className="text-sm font-medium text-[#1a2f5e]">Disable 2FA</p>
            <p className="text-xs text-gray-500">
              Requires your password and a current authenticator code.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="disable-password">Password</Label>
                <Input
                  id="disable-password"
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="disable-code">Authenticator code</Label>
                <Input
                  id="disable-code"
                  inputMode="numeric"
                  maxLength={6}
                  value={disableCode}
                  onChange={(e) =>
                    setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={disableTotp}
              disabled={busy || !disablePassword || disableCode.length !== 6}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Disable 2FA
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
