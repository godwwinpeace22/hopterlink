import { Button } from "../../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { Switch } from "../../../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useProviderAvailability } from "@/app/hooks/useProviderAvailability";
import { supabase } from "@/lib/supabase";
import { Plus } from "lucide-react";

const defaultRange = {
  start: "",
  end: "",
};

const timezoneOptions = [
  {
    value: "Africa/Lagos",
    label: "West Africa Time - Lagos",
    display: "(GMT+01:00) West Africa Time - Lagos",
  },
  {
    value: "UTC",
    label: "Coordinated Universal Time",
    display: "(GMT+00:00) Coordinated Universal Time",
  },
  {
    value: "Europe/London",
    label: "United Kingdom - London",
    display: "(GMT+00:00) United Kingdom - London",
  },
  {
    value: "America/New_York",
    label: "United States - New York",
    display: "(GMT-05:00) United States - New York",
  },
];

export const ProviderCalendar = () => {
  const { user } = useAuth();
  const { dates, setDates, settings, setSettings, isLoading, error } =
    useProviderAvailability(user?.id);
  const [anchorDate] = useState<Date>(() => new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const weekDates = useMemo(() => {
    const start = new Date(anchorDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [anchorDate]);

  const formatTime = (value: string) => {
    if (!value) return "";
    const [hours, minutes] = value.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date
      .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      .replace(" ", "")
      .toLowerCase();
  };

  const timeOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];
    for (let hour = 6; hour <= 20; hour += 1) {
      for (const minute of [0, 30]) {
        if (hour === 20 && minute === 30) continue;
        const value = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        options.push({ value, label: formatTime(value) });
      }
    }
    return options;
  }, []);

  const updateDayAvailability = (
    dateKey: string,
    updates: Partial<{ start: string; end: string }>,
    rangeIndex: number,
  ) => {
    setDates((prev) => {
      const current = prev[dateKey] ?? [];
      const next = current.map((range, index) =>
        index === rangeIndex
          ? {
              ...range,
              ...updates,
            }
          : range,
      );
      return {
        ...prev,
        [dateKey]: next,
      };
    });
  };

  const addRange = (dateKey: string) => {
    setDates((prev) => {
      const current = prev[dateKey] ?? [];
      return {
        ...prev,
        [dateKey]: [...current, { ...defaultRange }],
      };
    });
  };

  const removeRange = (dateKey: string, rangeIndex: number) => {
    setDates((prev) => {
      const current = prev[dateKey] ?? [];
      const next = current.filter((_, index) => index !== rangeIndex);
      return {
        ...prev,
        [dateKey]: next,
      };
    });
  };

  const hasInvalidRanges = useMemo(
    () =>
      Object.values(dates).some((ranges) =>
        ranges.some(
          (range) => !range.start || !range.end || range.start >= range.end,
        ),
      ),
    [dates],
  );

  const handleSaveAvailability = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase
        .from("provider_profiles")
        .update({
          availability: {
            dates,
            timezone: settings.timezone,
            recurring: settings.recurring,
          },
        })
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }
      toast.success("Availability saved", {
        description: "Your availability has been updated.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save availability.";
      setErrorMessage(message);
      toast.error("Unable to save availability", {
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200/80 bg-white">
        <CardHeader className="bg-[#FDEFD6]/40">
          <CardTitle className="tracking-tight">
            Availability Calendar
          </CardTitle>
          <CardDescription>
            Manage your availability for the next two weeks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-3xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Availability for this week
                </h3>
                <p className="text-xs text-gray-500">
                  Add one or more time ranges per day. No entries means
                  unavailable.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Recurring</span>
                <Switch
                  checked={settings.recurring}
                  onCheckedChange={(value) =>
                    setSettings((prev) => ({ ...prev, recurring: value }))
                  }
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {weekDates.map((date) => {
                const dateKey = date.toISOString().slice(0, 10);
                const dayRanges = dates[dateKey] ?? [];
                return (
                  <div
                    key={dateKey}
                    className="rounded-lg border border-gray-200/80 bg-white px-3 py-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {date.toLocaleDateString("en-US", {
                            weekday: "short",
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {dayRanges.length > 0
                            ? dayRanges
                                .map((range) =>
                                  range.start && range.end
                                    ? `${formatTime(
                                        range.start,
                                      )} – ${formatTime(range.end)}`
                                    : "Select time",
                                )
                                .join(", ")
                            : "Unavailable"}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full border-[#F7C876]/60 cursor-pointer"
                        onClick={() => addRange(dateKey)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-2 space-y-2">
                      {dayRanges.map((range, index) => (
                        <div
                          key={`${dateKey}-${index}`}
                          className="flex flex-wrap items-center gap-2 text-xs text-gray-600"
                        >
                          <Select
                            value={range.start}
                            onValueChange={(value) =>
                              updateDayAvailability(
                                dateKey,
                                { start: value },
                                index,
                              )
                            }
                          >
                            <SelectTrigger className="h-8 w-[110px]">
                              <SelectValue placeholder="Start" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-gray-400">–</span>
                          <Select
                            value={range.end}
                            onValueChange={(value) =>
                              updateDayAvailability(
                                dateKey,
                                { end: value },
                                index,
                              )
                            }
                          >
                            <SelectTrigger className="h-8 w-[110px]">
                              <SelectValue placeholder="End" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-red-500 hover:text-red-600"
                            onClick={() => removeRange(dateKey, index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-gray-600">
                Timezone
              </label>
              <select
                className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                value={settings.timezone}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    timezone: event.target.value,
                  }))
                }
              >
                {timezoneOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-xs text-gray-500">
                {timezoneOptions.find(
                  (option) => option.value === settings.timezone,
                )?.display ?? ""}
              </div>
            </div>
            {(errorMessage || error) && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage ??
                  (error instanceof Error
                    ? error.message
                    : "Unable to load availability.")}
              </div>
            )}
            {hasInvalidRanges && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Please select a valid start and end time for all availability
                ranges before saving.
              </div>
            )}
            <Button
              className="w-full mt-6 bg-[#F7C876] hover:bg-[#EFA055]"
              onClick={handleSaveAvailability}
              disabled={isSaving || isLoading || hasInvalidRanges}
            >
              {isSaving ? "Saving..." : "Save Availability"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
