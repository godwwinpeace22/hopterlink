import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "../../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Label } from "../../../ui/label";
import { Skeleton } from "../../../ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { toast } from "sonner";
import {
  getCurrencyForCountry,
  KNOWN_COUNTRIES,
  normalizeAllowedCountries,
  type AllowedCountry,
} from "@/app/lib/countryConfig";

type AppSettingsRow = {
  value: unknown;
};

export function AdminCountries() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("");

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

  const selectableCountries = useMemo(() => {
    const existingCodes = new Set(countries.map((country) => country.code));
    return KNOWN_COUNTRIES.filter(
      (country) => !existingCodes.has(country.code),
    );
  }, [countries]);

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
    const selectedCountry = KNOWN_COUNTRIES.find(
      (country) => country.code === selectedCountryCode,
    );

    if (!selectedCountry) {
      toast.error("Please select a country to add.");
      return;
    }

    if (countries.some((country) => country.code === selectedCountry.code)) {
      toast.error("This country is already in the allowed list.");
      return;
    }

    saveMutation.mutate([...countries, selectedCountry]);
    setSelectedCountryCode("");
    setIsAddDialogOpen(false);
  };

  const removeCountry = (code: string) => {
    const nextCountries = countries.filter((country) => country.code !== code);

    if (nextCountries.length === 0) {
      toast.error("At least one allowed country is required.");
      return;
    }

    saveMutation.mutate(nextCountries);
  };

  const openAddDialog = () => {
    if (selectableCountries.length === 0) {
      toast.error("All supported countries are already in the allowed list.");
      return;
    }

    setSelectedCountryCode(selectableCountries[0]?.code ?? "");
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Allowed Countries</h1>
          <p className="mt-1 text-sm text-gray-500">
            Control which countries are shown during client and provider signup.
          </p>
        </div>
        <Button onClick={openAddDialog} disabled={saveMutation.isPending}>
          Add country
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Allowed Countries</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`country-skeleton-${index}`}>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-14" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-8 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              ) : countries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-6 text-center text-gray-500"
                  >
                    No countries configured.
                  </TableCell>
                </TableRow>
              ) : (
                countries.map((country) => (
                  <TableRow key={country.code}>
                    <TableCell className="font-medium">
                      {country.name}
                    </TableCell>
                    <TableCell>{country.code}</TableCell>
                    <TableCell>{getCurrencyForCountry(country.code)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCountry(country.code)}
                        disabled={saveMutation.isPending}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Allowed Country</DialogTitle>
            <DialogDescription>
              Select a country from the supported list.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="allowed-country-select">Country</Label>
            <Select
              value={selectedCountryCode}
              onValueChange={setSelectedCountryCode}
            >
              <SelectTrigger id="allowed-country-select">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {selectableCountries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name} ({country.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={saveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={addCountry}
              disabled={!selectedCountryCode || saveMutation.isPending}
            >
              Add country
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
