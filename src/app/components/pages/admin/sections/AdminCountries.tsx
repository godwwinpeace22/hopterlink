import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "../../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { toast } from "sonner";
import {
  normalizeAllowedCountries,
  type AllowedCountry,
} from "@/app/lib/countryConfig";

type AppSettingsRow = {
  value: unknown;
};

export function AdminCountries() {
  const queryClient = useQueryClient();
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "app_settings", "allowed_countries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "allowed_countries")
        .maybeSingle();

      if (error) throw error;
      return (data as AppSettingsRow | null)?.value ?? null;
    },
  });

  const countries = useMemo(() => normalizeAllowedCountries(data), [data]);

  const saveMutation = useMutation({
    mutationFn: async (nextCountries: AllowedCountry[]) => {
      const { error } = await supabase.from("app_settings").upsert(
        {
          key: "allowed_countries",
          value: nextCountries,
        },
        { onConflict: "key" },
      );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "app_settings", "allowed_countries"],
      });
      queryClient.invalidateQueries({
        queryKey: ["app_settings", "allowed_countries"],
      });
      toast.success("Allowed countries updated.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update allowed countries.",
      );
    },
  });

  const addCountry = () => {
    const code = newCode.trim().toUpperCase();
    const name = newName.trim();

    if (code.length !== 2 || !name) {
      toast.error("Enter a valid 2-letter country code and country name.");
      return;
    }

    if (countries.some((country) => country.code === code)) {
      toast.error("This country is already in the allowed list.");
      return;
    }

    saveMutation.mutate([...countries, { code, name }]);
    setNewCode("");
    setNewName("");
  };

  const removeCountry = (code: string) => {
    const nextCountries = countries.filter((country) => country.code !== code);

    if (nextCountries.length === 0) {
      toast.error("At least one allowed country is required.");
      return;
    }

    saveMutation.mutate(nextCountries);
  };

  if (isLoading) {
    return <div className="text-gray-500">Loading country settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Allowed Countries</h1>
        <p className="text-sm text-gray-500 mt-1">
          Control which countries are shown during client and provider signup.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add country</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="country-code">Country code</Label>
              <Input
                id="country-code"
                placeholder="CA"
                value={newCode}
                onChange={(event) => setNewCode(event.target.value)}
                maxLength={2}
              />
            </div>
            <div>
              <Label htmlFor="country-name">Country name</Label>
              <Input
                id="country-name"
                placeholder="Canada"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
              />
            </div>
          </div>
          <Button onClick={addCountry} disabled={saveMutation.isPending}>
            Add country
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current allowed countries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {countries.map((country) => (
              <div
                key={country.code}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div>
                  <p className="font-medium text-gray-900">{country.name}</p>
                  <p className="text-xs text-gray-500">{country.code}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeCountry(country.code)}
                  disabled={saveMutation.isPending}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
