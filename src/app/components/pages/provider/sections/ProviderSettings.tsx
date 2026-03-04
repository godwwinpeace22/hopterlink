import { useEffect, useState } from "react";
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

export const ProviderSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isSavingPayout, setIsSavingPayout] = useState(false);
  const [autoWithdrawalEnabled, setAutoWithdrawalEnabled] = useState(false);
  const [bankAccount, setBankAccount] =
    useState<BankAccountDetails>(defaultBankAccount);

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

  useEffect(() => {
    if (!profileMetadataQuery.data?.data) return;

    const walletMetadata = normalizeProviderWalletMetadata(
      profileMetadataQuery.data.data.metadata,
    );

    setAutoWithdrawalEnabled(walletMetadata.autoWithdrawalEnabled);
    setBankAccount(walletMetadata.bankAccount ?? defaultBankAccount);
  }, [profileMetadataQuery.data?.data]);

  useEffect(() => {
    if (!profileMetadataQuery.data?.error) return;
    toast.error(profileMetadataQuery.data.error.message);
  }, [profileMetadataQuery.data?.error]);

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

  return (
    <div className="max-w-3xl space-y-6">
      <Tabs defaultValue="payout" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payout">Payout</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

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

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
                <div>
                  <p className="font-medium">Bank account verified</p>
                  <p className="text-sm text-muted-foreground">
                    Toggle while manual payout verification is handled by
                    operations.
                  </p>
                </div>
                <Switch
                  checked={bankAccount.verified}
                  onCheckedChange={(checked) =>
                    updateBankField("verified", checked)
                  }
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
                <Input type="password" placeholder="Current password" />
                <Input type="password" placeholder="New password" />
                <Input type="password" placeholder="Confirm new password" />
                <Button>Update Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
