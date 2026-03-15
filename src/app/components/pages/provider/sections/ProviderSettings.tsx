import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { Switch } from "../../../ui/switch";
import { Label } from "../../../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import { PageHeader } from "../../../ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { Textarea } from "../../../ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useSupabaseQuery } from "@/lib/useSupabaseQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { WALLET_CONFIG } from "@/app/config/walletConfig";
import {
  BankAccountDetails,
  ProviderWalletMetadata,
  buildWalletMetadataPatch,
  normalizeProviderWalletMetadata,
} from "@/app/lib/providerWalletMetadata";
import { useServiceCategories } from "@/lib/useServiceCategories";

const defaultBankAccount: BankAccountDetails = {
  accountName: "",
  bankName: "",
  institutionNumber: "",
  transitNumber: "",
  accountNumber: "",
  country: "CA",
  currency: WALLET_CONFIG.currency,
  verified: true,
};

const parseServiceMinimumHours = (
  value: Record<string, unknown> | null | undefined,
  services: string[],
) => {
  const result: Record<string, string> = {};

  for (const service of services) {
    const rawValue = value?.[service];
    if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
      result[service] = String(rawValue);
      continue;
    }

    if (typeof rawValue === "string" && rawValue.trim()) {
      result[service] = rawValue.trim();
    }
  }

  return result;
};

const buildServiceMinimumHoursPayload = (
  services: string[],
  values: Record<string, string>,
) => {
  const payload: Record<string, number> = {};

  for (const service of services) {
    const normalized = values[service]?.trim();
    if (!normalized) continue;

    const parsed = Number(normalized);
    if (Number.isFinite(parsed) && parsed > 0) {
      payload[service] = Number(parsed.toFixed(2));
    }
  }

  return payload;
};

export const ProviderSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const hasInitialized = useRef(false);
  const { categoryNames } = useServiceCategories();
  const [isSavingPayout, setIsSavingPayout] = useState(false);
  const [isSavingPricing, setIsSavingPricing] = useState(false);
  const [autoWithdrawalEnabled, setAutoWithdrawalEnabled] = useState(false);
  const [bankAccount, setBankAccount] =
    useState<BankAccountDetails>(defaultBankAccount);
  const [businessName, setBusinessName] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [selectedServices, setSelectedServices] = useState("");
  const [bio, setBio] = useState("");
  const [serviceMinimumHours, setServiceMinimumHours] = useState<
    Record<string, string>
  >({});

  const profileMetadataQuery = useSupabaseQuery(
    ["profile_metadata", user?.id],
    () =>
      supabase
        .from("profiles")
        .select("metadata")
        .eq("id", user?.id ?? "")
        .single(),
    { enabled: Boolean(user?.id) },
  );

  const providerProfileQuery = useSupabaseQuery(
    ["provider_settings_profile", user?.id],
    () =>
      supabase
        .from("provider_profiles")
        .select(
          "business_name, hourly_rate, services, bio, service_minimum_hours",
        )
        .eq("user_id", user?.id ?? "")
        .maybeSingle(),
    { enabled: Boolean(user?.id) },
  );

  useEffect(() => {
    if (!profileMetadataQuery.data?.data) return;

    const walletMetadata = normalizeProviderWalletMetadata(
      profileMetadataQuery.data.data.metadata,
    );

    setAutoWithdrawalEnabled(walletMetadata.autoWithdrawalEnabled);
    setBankAccount(walletMetadata.bankAccount ?? defaultBankAccount);
  }, [profileMetadataQuery.data?.data]);

  useEffect(() => {
    const profileData = providerProfileQuery.data?.data;
    if (!profileData || hasInitialized.current) return;

    hasInitialized.current = true;
    const services = profileData.services ?? [];
    setBusinessName(profileData.business_name ?? "");
    setHourlyRate(
      typeof profileData.hourly_rate === "number"
        ? String(profileData.hourly_rate)
        : "",
    );
    setSelectedServices(services[0] ?? "");
    setBio(profileData.bio ?? "");
    setServiceMinimumHours(
      parseServiceMinimumHours(
        (profileData.service_minimum_hours as Record<string, unknown> | null) ??
          null,
        services,
      ),
    );
  }, [providerProfileQuery.data?.data]);

  useEffect(() => {
    if (!profileMetadataQuery.data?.error) return;
    toast.error(profileMetadataQuery.data.error.message);
  }, [profileMetadataQuery.data?.error]);

  useEffect(() => {
    if (!providerProfileQuery.data?.error) return;
    toast.error(providerProfileQuery.data.error.message);
  }, [providerProfileQuery.data?.error]);

  const toggleService = (service: string) => {
    setSelectedServices(service);
  };

  useEffect(() => {
    setServiceMinimumHours((previous) => {
      const next: Record<string, string> = {};
      if (selectedServices) {
        next[selectedServices] = previous[selectedServices] ?? "";
      }
      return next;
    });
  }, [selectedServices]);

  const updateBankField = (
    field: keyof BankAccountDetails,
    value: string | boolean,
  ) => {
    setBankAccount((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const savePayoutSettingsMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User not found.");
      }

      const existingWallet = normalizeProviderWalletMetadata(
        profileMetadataQuery.data?.data?.metadata,
      );

      const updatedWalletMetadata: ProviderWalletMetadata = {
        ...existingWallet,
        autoWithdrawalEnabled,
        bankAccount: {
          accountName: bankAccount.accountName.trim(),
          bankName: bankAccount.bankName.trim(),
          institutionNumber: bankAccount.institutionNumber.trim(),
          transitNumber: bankAccount.transitNumber.trim(),
          accountNumber: bankAccount.accountNumber.trim(),
          country: bankAccount.country.trim().toUpperCase(),
          currency: bankAccount.currency.trim().toUpperCase(),
          verified: existingWallet.bankAccount ? bankAccount.verified : true,
        },
      };

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          metadata: buildWalletMetadataPatch(
            profileMetadataQuery.data?.data?.metadata,
            updatedWalletMetadata,
          ),
        })
        .eq("id", user.id);

      if (updateError) {
        throw new Error(updateError.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile_metadata", user?.id],
      });
      toast.success("Payout settings updated.");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Unable to save settings.";
      toast.error(message);
    },
  });

  const savePricingSettingsMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User not found.");
      }

      const services = selectedServices ? [selectedServices] : [];
      if (services.length === 0) {
        throw new Error("Add at least one service to manage pricing.");
      }

      const hourlyRateNumber = hourlyRate.trim() ? Number(hourlyRate) : null;
      if (
        hourlyRate.trim() &&
        (!Number.isFinite(hourlyRateNumber) ||
          hourlyRateNumber === null ||
          hourlyRateNumber <= 0)
      ) {
        throw new Error("Hourly rate must be greater than zero.");
      }

      const { error } = await supabase
        .from("provider_profiles")
        .update({
          business_name: businessName.trim() || null,
          hourly_rate:
            hourlyRateNumber === null
              ? null
              : Number(hourlyRateNumber.toFixed(2)),
          services,
          bio: bio.trim() || null,
          service_minimum_hours: buildServiceMinimumHoursPayload(
            services,
            serviceMinimumHours,
          ),
        })
        .eq("user_id", user.id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["provider_settings_profile", user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard_profile_provider", user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["public-providers"] });
      queryClient.invalidateQueries({
        queryKey: ["provider-profile", user?.id],
      });
      toast.success("Pricing settings updated.");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Unable to save pricing.";
      toast.error(message);
    },
  });

  const handleSavePayoutSettings = async () => {
    if (!bankAccount.accountName.trim() || !bankAccount.bankName.trim()) {
      toast.error("Account name and bank name are required.");
      return;
    }

    if (bankAccount.institutionNumber.trim().length !== 3) {
      toast.error("Institution number must be exactly 3 digits.");
      return;
    }

    if (bankAccount.transitNumber.trim().length !== 5) {
      toast.error("Transit number must be exactly 5 digits.");
      return;
    }

    if (bankAccount.accountNumber.trim().length < 7) {
      toast.error("Account number must be at least 7 digits.");
      return;
    }

    setIsSavingPayout(true);
    try {
      await savePayoutSettingsMutation.mutateAsync();
    } finally {
      setIsSavingPayout(false);
    }
  };

  const handleSavePricingSettings = async () => {
    setIsSavingPricing(true);
    try {
      await savePricingSettingsMutation.mutateAsync();
    } finally {
      setIsSavingPricing(false);
    }
  };

  return (
    <div className="space-y-6 pt-6">
      <PageHeader title="Settings" hideBack />
      <Tabs defaultValue="pricing" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="payout">Payout</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Business & Pricing</CardTitle>
              <CardDescription>
                Set your hourly rate and optional minimum billable hours for
                each listed service.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="business-name">Business name</Label>
                  <Input
                    id="business-name"
                    className="max-w-xl"
                    value={businessName}
                    onChange={(event) => setBusinessName(event.target.value)}
                    placeholder="Business or provider name"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="hourly-rate">Hourly rate (CAD)</Label>
                  <Input
                    id="hourly-rate"
                    type="number"
                    className="max-w-xl"
                    inputMode="decimal"
                    min="0"
                    value={hourlyRate}
                    onChange={(event) => setHourlyRate(event.target.value)}
                    placeholder="75"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="service">Service</Label>
                  <Select
                    value={selectedServices}
                    onValueChange={toggleService}
                  >
                    <SelectTrigger id="service" className="max-w-xl">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryNames.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!selectedServices && (
                    <p className="text-xs text-muted-foreground">
                      Select a service to continue.
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="business-bio">Business bio</Label>
                  <Textarea
                    id="business-bio"
                    className="max-w-xl"
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    placeholder="Tell clients about your experience and what you offer."
                    rows={5}
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-lg border p-4">
                <div>
                  <p className="font-medium">Minimum billable hours</p>
                  <p className="text-sm text-muted-foreground">
                    Leave a service blank if you do not want a minimum.
                  </p>
                </div>

                {!selectedServices ? (
                  <p className="text-sm text-muted-foreground">
                    Select a service above to configure minimum billable hours.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor={`minimum-hours-${selectedServices}`}>
                      {selectedServices}
                    </Label>
                    <Input
                      id={`minimum-hours-${selectedServices}`}
                      className="max-w-xl"
                      inputMode="decimal"
                      value={serviceMinimumHours[selectedServices] ?? ""}
                      onChange={(event) =>
                        setServiceMinimumHours((previous) => ({
                          ...previous,
                          [selectedServices]: event.target.value,
                        }))
                      }
                      placeholder="Optional minimum hours"
                    />
                  </div>
                )}
              </div>

              <Button
                onClick={handleSavePricingSettings}
                disabled={isSavingPricing}
              >
                {isSavingPricing ? "Saving..." : "Save pricing settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payout">
          <Card>
            <CardHeader>
              <CardTitle>Payout & Bank Account</CardTitle>
              <CardDescription>
                Save payout details for manual processing. Auto-withdrawal
                creates requests every {WALLET_CONFIG.payoutDayLabel}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground flex flex-wrap items-center justify-between gap-3">
                <span>
                  Minimum withdrawal:{" "}
                  <span className="font-medium text-foreground">
                    {WALLET_CONFIG.minimumWithdrawalAmount}{" "}
                    {WALLET_CONFIG.currency}
                  </span>
                </span>
                <Badge variant="secondary">
                  {bankAccount.verified
                    ? "Bank verified"
                    : "Verification pending"}
                </Badge>
              </div> */}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bank-account-name">Account name</Label>
                  <Input
                    id="bank-account-name"
                    className="max-w-4xl"
                    value={bankAccount.accountName}
                    onChange={(event) =>
                      updateBankField("accountName", event.target.value)
                    }
                    placeholder="Business or personal account name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank-name">Bank name</Label>
                  <Input
                    id="bank-name"
                    className="max-w-4xl"
                    value={bankAccount.bankName}
                    onChange={(event) =>
                      updateBankField("bankName", event.target.value)
                    }
                    placeholder="Bank name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank-institution-number">
                    Institution number (3 digits)
                  </Label>
                  <Input
                    id="bank-institution-number"
                    className="max-w-4xl"
                    maxLength={3}
                    value={bankAccount.institutionNumber}
                    onChange={(event) =>
                      updateBankField(
                        "institutionNumber",
                        event.target.value.replace(/[^0-9]/g, "").slice(0, 3),
                      )
                    }
                    placeholder="001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank-transit-number">
                    Transit number (5 digits)
                  </Label>
                  <Input
                    id="bank-transit-number"
                    className="max-w-4xl"
                    maxLength={5}
                    value={bankAccount.transitNumber}
                    onChange={(event) =>
                      updateBankField(
                        "transitNumber",
                        event.target.value.replace(/[^0-9]/g, "").slice(0, 5),
                      )
                    }
                    placeholder="12345"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank-account-number">Account number</Label>
                  <Input
                    id="bank-account-number"
                    className="max-w-4xl"
                    value={bankAccount.accountNumber}
                    onChange={(event) =>
                      updateBankField(
                        "accountNumber",
                        event.target.value.replace(/[^0-9]/g, ""),
                      )
                    }
                    placeholder="1234567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank-country">Country code</Label>
                  <Input
                    id="bank-country"
                    className="max-w-4xl"
                    maxLength={2}
                    value={bankAccount.country}
                    readOnly
                    onChange={(event) =>
                      updateBankField(
                        "country",
                        event.target.value.toUpperCase(),
                      )
                    }
                    placeholder="CA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank-currency">Currency</Label>
                  <Input
                    id="bank-currency"
                    className="max-w-4xl"
                    maxLength={3}
                    value={bankAccount.currency}
                    readOnly
                    onChange={(event) =>
                      updateBankField(
                        "currency",
                        event.target.value.toUpperCase(),
                      )
                    }
                    placeholder="CAD"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
                <div>
                  <p className="font-medium">Enable auto-withdrawal</p>
                  <p className="text-sm text-muted-foreground">
                    Auto requests are created every{" "}
                    {WALLET_CONFIG.payoutDayLabel} in {WALLET_CONFIG.timezone}.
                  </p>
                </div>
                <Switch
                  checked={autoWithdrawalEnabled}
                  onCheckedChange={setAutoWithdrawalEnabled}
                />
              </div>

              <Button
                onClick={handleSavePayoutSettings}
                disabled={isSavingPayout}
              >
                {isSavingPayout ? "Saving..." : "Save payout settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage how you receive account and booking updates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>New Job Requests</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex justify-between items-center">
                  <span>Messages</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex justify-between items-center">
                  <span>Payment Updates</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="password"
                  className="max-w-4xl"
                  placeholder="Current password"
                />
                <Input
                  type="password"
                  className="max-w-4xl"
                  placeholder="New password"
                />
                <Input
                  type="password"
                  className="max-w-4xl"
                  placeholder="Confirm new password"
                />
                <Button>Update Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
