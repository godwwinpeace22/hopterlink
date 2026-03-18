import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@/lib/router";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useSupabaseQuery } from "@/lib/useSupabaseQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Separator } from "@/app/components/ui/separator";
import { Switch } from "@/app/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";
import { Bell, Camera, Lock, LogOut, Trash2, User } from "lucide-react";
import { PageHeader } from "@/app/components/ui/page-header";

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "U";
  return parts
    .map((p) => p[0])
    .join("")
    .toUpperCase();
};

export function ClientSettings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // ── Profile fields ──────────────────────────────────────────
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);

  // ── Password fields ──────────────────────────────────────────
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // ── Notification prefs ───────────────────────────────────────
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifSms, setNotifSms] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  // ── Load profile ─────────────────────────────────────────────
  const { data: profileResult } = useSupabaseQuery(
    ["settings_profile", user?.id],
    () =>
      supabase
        .from("profiles")
        .select("full_name, phone, avatar_url, location, email")
        .eq("id", user?.id ?? "")
        .single(),
    { enabled: Boolean(user?.id) },
  );

  const { data: clientProfileResult } = useSupabaseQuery(
    ["settings_client_profile", user?.id],
    () =>
      supabase
        .from("client_profiles")
        .select("notification_preferences")
        .eq("user_id", user?.id ?? "")
        .single(),
    { enabled: Boolean(user?.id) },
  );

  useEffect(() => {
    if (!profileResult?.data) return;
    const p = profileResult.data;
    setFullName(p.full_name ?? "");
    setPhone(p.phone ?? "");
    setAvatarUrl(p.avatar_url ?? "");
    const loc = p.location as { city?: string; address?: string } | null;
    setCity(loc?.city ?? loc?.address ?? "");
  }, [profileResult?.data]);

  useEffect(() => {
    const prefs = clientProfileResult?.data?.notification_preferences as Record<
      string,
      boolean
    > | null;
    if (!prefs) return;
    setNotifEmail(prefs.email ?? true);
    setNotifPush(prefs.push ?? true);
    setNotifSms(prefs.sms ?? false);
  }, [clientProfileResult?.data]);

  // ── Avatar resize helper (canvas, no external library) ──────
  const resizeImage = (
    file: File,
    maxPx = 512,
    quality = 0.85,
  ): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas unavailable"));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Resize failed"))),
          "image/webp",
          quality,
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Image load failed"));
      };
      img.src = objectUrl;
    });

  // ── Avatar upload ────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so the same file can be re-selected after an error
    e.target.value = "";
    if (!file || !user?.id) return;

    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(t("clientSettings.avatarTypeError"));
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(
        t("clientSettings.avatarSizeError", {
          size: (file.size / 1024 / 1024).toFixed(1),
        }),
      );
      return;
    }

    setAvatarUploading(true);
    try {
      const resized = await resizeImage(file);
      const filePath = `${user.id}/avatar.webp`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, resized, { upsert: true, contentType: "image/webp" });
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const urlWithBust = `${publicUrl}?t=${Date.now()}`;
      await supabase
        .from("profiles")
        .update({ avatar_url: urlWithBust })
        .eq("id", user.id);
      setAvatarUrl(urlWithBust);
      queryClient.invalidateQueries({
        queryKey: ["settings_profile", user.id],
      });
      toast.success(t("clientSettings.avatarUpdated"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setAvatarUploading(false);
    }
  };

  // ── Save profile ─────────────────────────────────────────────
  const profileMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      const location = city.trim() ? { city: city.trim() } : undefined;
      const patch: Record<string, unknown> = {
        full_name: fullName.trim(),
        phone: phone.trim(),
      };
      if (location !== undefined) patch.location = location;
      const { error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["settings_profile", user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard_profile", user?.id],
      });
      toast.success(t("clientSettings.profileUpdated"));
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed to save."),
  });

  // ── Change password ───────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error(t("clientSettings.passwordFields"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("clientSettings.passwordNoMatch"));
      return;
    }
    if (newPassword.length < 8) {
      toast.error(t("clientSettings.passwordMinLength"));
      return;
    }
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      toast.success(t("clientSettings.passwordUpdated"));
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update password.",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // ── Save notification prefs ───────────────────────────────────
  const handleSaveNotifications = async () => {
    if (!user?.id) return;
    setNotifLoading(true);
    try {
      const prefs = { email: notifEmail, push: notifPush, sms: notifSms };
      const { error } = await supabase
        .from("client_profiles")
        .update({ notification_preferences: prefs })
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success(t("clientSettings.notifUpdated"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setNotifLoading(false);
    }
  };

  // ── Delete / sign out ─────────────────────────────────────────
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    try {
      if (user?.id) {
        await supabase
          .from("profiles")
          .update({ is_active: false })
          .eq("id", user.id);
      }
    } finally {
      await signOut();
      navigate("/");
    }
  };

  const email = profileResult?.data?.email ?? user?.email ?? "";

  return (
    <div className="max-w-2xl space-y-6 pt-6">
      <PageHeader title={t("clientSettings.title")} />

      <Tabs defaultValue="profile">
        <TabsList className="w-full">
          <TabsTrigger value="profile" className="flex-1 gap-1.5">
            <User className="h-3.5 w-3.5" />
            {t("clientSettings.tabProfile")}
          </TabsTrigger>
          <TabsTrigger value="password" className="flex-1 gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            {t("clientSettings.tabPassword")}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1 gap-1.5">
            <Bell className="h-3.5 w-3.5" />
            {t("clientSettings.tabNotifications")}
          </TabsTrigger>
          <TabsTrigger value="account" className="flex-1 gap-1.5">
            <LogOut className="h-3.5 w-3.5" />
            {t("clientSettings.tabAccount")}
          </TabsTrigger>
        </TabsList>

        {/* ── PROFILE TAB ── */}
        <TabsContent value="profile" className="mt-5 space-y-5">
          {/* Avatar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("clientSettings.avatarSection")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-5">
              <div className="relative">
                <Avatar className="h-20 w-20 border-2 border-[#F7C876]/50">
                  {avatarUrl && <AvatarImage src={avatarUrl} />}
                  <AvatarFallback className="bg-[#F1A400] text-white text-xl font-bold">
                    {getInitials(fullName || "U")}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#F1A400] text-white shadow hover:bg-[#C17A00] disabled:opacity-60"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {avatarUploading
                    ? t("clientSettings.uploading")
                    : t("clientSettings.clickToChange")}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("clientSettings.fileFormat")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("clientSettings.personalInfoTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">
                  {t("clientSettings.fullName")}
                </Label>
                <Input
                  id="full-name"
                  placeholder={t("clientSettings.fullNamePlaceholder")}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("clientSettings.emailLabel")}</Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="bg-slate-50 text-slate-500"
                />
                <p className="text-xs text-slate-400">
                  {t("clientSettings.emailReadonly")}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("clientSettings.phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t("clientSettings.phonePlaceholder")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">{t("clientSettings.city")}</Label>
                <Input
                  id="city"
                  placeholder={t("clientSettings.cityPlaceholder")}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <Button
                onClick={() => profileMutation.mutate()}
                disabled={profileMutation.isPending}
                className="bg-[#F1A400] hover:bg-[#C17A00] text-white"
              >
                {profileMutation.isPending
                  ? t("clientSettings.savingProfile")
                  : t("clientSettings.saveProfile")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PASSWORD TAB ── */}
        <TabsContent value="password" className="mt-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("clientSettings.passwordCardTitle")}
              </CardTitle>
              <CardDescription>
                {t("clientSettings.passwordCardDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">
                  {t("clientSettings.newPassword")}
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder={t("clientSettings.newPasswordPlaceholder")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">
                  {t("clientSettings.confirmPassword")}
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder={t("clientSettings.confirmPasswordPlaceholder")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={passwordLoading}
                className="bg-[#F1A400] hover:bg-[#C17A00] text-white"
              >
                {passwordLoading
                  ? t("clientSettings.savingPassword")
                  : t("clientSettings.savePassword")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── NOTIFICATIONS TAB ── */}
        <TabsContent value="notifications" className="mt-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("clientSettings.notifCardTitle")}
              </CardTitle>
              <CardDescription>
                {t("clientSettings.notifCardDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-0 divide-y">
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {t("clientSettings.notifEmail")}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t("clientSettings.notifEmailDesc")}
                  </p>
                </div>
                <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
              </div>
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {t("clientSettings.notifPush")}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t("clientSettings.notifPushDesc")}
                  </p>
                </div>
                <Switch checked={notifPush} onCheckedChange={setNotifPush} />
              </div>
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {t("clientSettings.notifSms")}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t("clientSettings.notifSmsDesc")}
                  </p>
                </div>
                <Switch
                  checked={notifSms}
                  disabled
                  onCheckedChange={setNotifSms}
                />
              </div>
              <div className="pt-4">
                <Button
                  onClick={handleSaveNotifications}
                  disabled={notifLoading}
                  className="bg-[#F1A400] hover:bg-[#C17A00] text-white"
                >
                  {notifLoading
                    ? t("clientSettings.savingNotif")
                    : t("clientSettings.saveNotif")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ACCOUNT TAB ── */}
        <TabsContent value="account" className="mt-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("clientSettings.accountCardTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4 text-slate-500 shrink-0" />
                <span className="flex-1 text-sm font-medium text-slate-900">
                  {t("clientSettings.signOutButton")}
                </span>
              </button>
              <Separator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="flex w-full items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-red-50">
                    <Trash2 className="h-4 w-4 text-red-500 shrink-0" />
                    <span className="flex-1 text-sm font-medium text-red-600">
                      {t("clientSettings.deleteAccountButton")}
                    </span>
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("clientSettings.deleteAccountButton")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("clientSettings.deleteAccountPermanent")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={handleDeleteAccount}
                    >
                      {t("clientSettings.deleteAccountButton")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
