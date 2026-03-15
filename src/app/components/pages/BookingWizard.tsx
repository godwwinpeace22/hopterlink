import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@/lib/router";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import { Skeleton } from "../ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Star,
  CheckCircle,
  Upload,
  FileText,
  ImageIcon,
  CreditCard,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseQuery } from "@/lib/useSupabaseQuery";
import { WALLET_CONFIG } from "@/app/config/walletConfig";
import { useWalletTopups } from "@/app/hooks/useWalletTopups";
import { useCreateWalletTopupCheckout } from "@/app/hooks/useCreateWalletTopupCheckout";
import {
  buildAvailabilityStartTimes,
  formatAvailabilitySummary,
  formatAvailabilityTimeLabel,
  normalizeAvailability,
  resolveAvailabilityForDate,
  toDateKey,
  type NormalizedAvailability,
} from "@/lib/providerAvailability";

interface BookingWizardProps {
  data?: any;
}

type BookingStep =
  | "service"
  | "datetime"
  | "details"
  | "photos"
  | "payment"
  | "review";

type ProviderData = {
  id: string;
  name: string;
  businessName: string;
  rating: number;
  totalReviews: number;
  hourlyRate: number;
  avatar: string;
  services: string[];
  serviceMinimumHours: Record<string, number>;
  availability: NormalizedAvailability;
};

type SelectedPhoto = File | string;

const isValidDate = (value: unknown): value is Date => {
  return value instanceof Date && !Number.isNaN(value.getTime());
};

const parseServiceMinimumHours = (value: unknown): Record<string, number> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce(
    (acc, [service, rawValue]) => {
      const numericValue = Number(rawValue);
      if (Number.isFinite(numericValue) && numericValue > 0) {
        acc[service] = numericValue;
      }
      return acc;
    },
    {} as Record<string, number>,
  );
};

export function BookingWizard({ data }: BookingWizardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const providerId = useMemo(() => {
    if (typeof window === "undefined") {
      return data?.providerId as string | undefined;
    }
    return (
      (data?.providerId as string | undefined) ??
      window.sessionStorage.getItem("bookingProviderId") ??
      undefined
    );
  }, [data?.providerId]);
  const [currentStep, setCurrentStep] = useState<BookingStep>("service");
  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [providerStatus, setProviderStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    service: "",
    customService: "",
    selectedDate: undefined as Date | undefined,
    selectedTime: "",
    address: "",
    description: "",
    requestedHours: "2",
    urgency: "flexible" as "urgent" | "flexible",
    photos: [] as SelectedPhoto[],
    paymentMethod: "wallet" as "wallet",
    cardNumber: "",
    cardExpiry: "",
    cardCVC: "",
    agreeToTerms: false,
  });
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!providerId || typeof window === "undefined") {
      return;
    }
    window.sessionStorage.setItem("bookingProviderId", providerId);
  }, [providerId]);

  useEffect(() => {
    setHasHydrated(false);
    if (!providerId || typeof window === "undefined") {
      setHasHydrated(true);
      return;
    }
    const stored = window.sessionStorage.getItem(`bookingWizard:${providerId}`);
    if (!stored) {
      setHasHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as {
        currentStep?: BookingStep;
        bookingData?: typeof bookingData & { selectedDate?: string | null };
      };

      if (parsed.currentStep) {
        setCurrentStep(parsed.currentStep);
      }

      if (parsed.bookingData) {
        const storedDate = parsed.bookingData.selectedDate ?? null;
        const parsedDate = storedDate ? new Date(storedDate) : null;
        setBookingData((prev) => ({
          ...prev,
          ...parsed.bookingData,
          selectedDate: isValidDate(parsedDate) ? parsedDate : undefined,
        }));
      }
    } catch {
      window.sessionStorage.removeItem(`bookingWizard:${providerId}`);
    } finally {
      setHasHydrated(true);
    }
  }, [providerId]);

  useEffect(() => {
    if (!providerId || typeof window === "undefined" || !hasHydrated) {
      return;
    }
    const payload = {
      currentStep,
      bookingData: {
        ...bookingData,
        photos: [],
        selectedDate: isValidDate(bookingData.selectedDate)
          ? bookingData.selectedDate.toISOString()
          : null,
      },
    };
    window.sessionStorage.setItem(
      `bookingWizard:${providerId}`,
      JSON.stringify(payload),
    );
  }, [providerId, currentStep, bookingData]);

  useEffect(() => {
    const objectUrls: string[] = [];
    const previews = bookingData.photos.map((photo) => {
      if (photo instanceof File) {
        const url = URL.createObjectURL(photo);
        objectUrls.push(url);
        return url;
      }

      if (typeof photo === "string" && photo.trim()) {
        return photo;
      }

      return "";
    });

    setPhotoPreviewUrls(previews);

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [bookingData.photos]);

  const { data: providerResult, isFetching: providerLoading } =
    useSupabaseQuery(
      ["provider_profile", providerId],
      () =>
        supabase
          .from("provider_profiles")
          .select(
            `
          user_id,
          business_name,
          services,
          hourly_rate,
          service_minimum_hours,
          rating,
          total_reviews,
          availability,
          profile:profiles!provider_profiles_user_id_fkey (
            full_name,
            avatar_url
          )
        `,
          )
          .eq("user_id", providerId ?? "")
          .maybeSingle(),
      { enabled: Boolean(providerId) },
    );

  const balanceQuery = useSupabaseQuery(
    ["booking_wallet_balance", user?.id],
    () =>
      supabase.rpc("compute_wallet_balance", {
        p_user_id: user?.id ?? "",
      }),
    { enabled: Boolean(user?.id) },
  );

  const { topups, isLoading: isTopupsLoading } = useWalletTopups(user?.id);
  const createTopupCheckoutMutation = useCreateWalletTopupCheckout();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: WALLET_CONFIG.currency,
      maximumFractionDigits: 2,
    }).format(amount);

  const availableWalletBalance = Math.max(
    Number(balanceQuery.data?.data ?? 0),
    0,
  );

  const selectedService = bookingData.service || bookingData.customService;

  const requestedHours = useMemo(() => {
    const parsed = Number.parseFloat(bookingData.requestedHours || "0");
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [bookingData.requestedHours]);

  const minimumBillableHours = useMemo(() => {
    if (!provider) {
      return 0;
    }

    return selectedService
      ? (provider.serviceMinimumHours[selectedService] ?? 0)
      : 0;
  }, [provider, selectedService]);

  const billableHours = useMemo(() => {
    if (!requestedHours) {
      return minimumBillableHours > 0 ? minimumBillableHours : 0;
    }

    return Math.max(requestedHours, minimumBillableHours);
  }, [minimumBillableHours, requestedHours]);

  const estimatedTotal = useMemo(() => {
    if (!provider) {
      return 0;
    }

    return Number((provider.hourlyRate * billableHours).toFixed(2));
  }, [billableHours, provider]);

  const walletShortfall = useMemo(
    () => Math.max(estimatedTotal - availableWalletBalance, 0),
    [availableWalletBalance, estimatedTotal],
  );

  const selectedDateKey = useMemo(
    () => toDateKey(bookingData.selectedDate),
    [bookingData.selectedDate],
  );

  const resolvedAvailabilityDay = useMemo(() => {
    if (!provider || !selectedDateKey) {
      return null;
    }

    return resolveAvailabilityForDate(provider.availability, selectedDateKey);
  }, [provider, selectedDateKey]);

  const availableTimeOptions = useMemo(() => {
    if (
      !resolvedAvailabilityDay ||
      !provider?.availability.hasExplicitAvailability
    ) {
      return [];
    }

    return buildAvailabilityStartTimes(
      resolvedAvailabilityDay,
      requestedHours || 0,
    );
  }, [provider, requestedHours, resolvedAvailabilityDay]);

  const isWalletSufficient = walletShortfall <= 0;
  const isWalletLoading = isTopupsLoading || balanceQuery.isLoading;

  useEffect(() => {
    if (!providerId) {
      setErrorMessage("No provider selected.");
      setProviderStatus("error");
      setProvider(null);
      return;
    }

    if (providerLoading) {
      setProviderStatus("loading");
      setErrorMessage(null);
      return;
    }

    if (providerResult?.error) {
      setErrorMessage(providerResult.error.message);
      setProviderStatus("error");
      return;
    }

    if (!providerResult?.data) {
      setProviderStatus("error");
      return;
    }

    const providerProfile = providerResult.data;
    const availability = normalizeAvailability(providerProfile.availability);

    setProvider({
      id: providerProfile.user_id,
      name: providerProfile.profile?.full_name ?? "Service Provider",
      businessName:
        providerProfile.business_name ??
        providerProfile.profile?.full_name ??
        "Service Provider",
      rating: providerProfile.rating ?? 0,
      totalReviews: providerProfile.total_reviews ?? 0,
      hourlyRate: providerProfile.hourly_rate ?? 0,
      avatar: providerProfile.profile?.avatar_url ?? "",
      services: providerProfile.services ?? [],
      serviceMinimumHours: parseServiceMinimumHours(
        providerProfile.service_minimum_hours,
      ),
      availability,
    });
    setProviderStatus("ready");
  }, [providerId, providerLoading, providerResult]);

  useEffect(() => {
    if (!provider?.availability.hasExplicitAvailability) {
      return;
    }

    if (!bookingData.selectedTime) {
      return;
    }

    const isStillAvailable = availableTimeOptions.some(
      (option) => option.value === bookingData.selectedTime,
    );

    if (!isStillAvailable) {
      setBookingData((prev) => ({
        ...prev,
        selectedTime: "",
      }));
    }
  }, [
    availableTimeOptions,
    bookingData.selectedTime,
    provider?.availability.hasExplicitAvailability,
  ]);

  const steps: { id: BookingStep; label: string; icon: any }[] = [
    { id: "service", label: "Select Service", icon: FileText },
    { id: "datetime", label: "Date & Time", icon: CalendarIcon },
    { id: "details", label: "Job Details", icon: MapPin },
    { id: "photos", label: "Photos (Optional)", icon: Upload },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "review", label: "Review & Confirm", icon: CheckCircle },
  ];

  const getCurrentStepIndex = () =>
    steps.findIndex((s) => s.id === currentStep);

  const stepOrder: BookingStep[] = [
    "service",
    "datetime",
    "details",
    "photos",
    "payment",
    "review",
  ];

  const handleNext = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleWalletTopup = async () => {
    if (!user?.id) {
      setErrorMessage("You must be signed in to top up your wallet.");
      return;
    }

    const amountCents = Math.max(Math.ceil(walletShortfall * 100), 100);

    try {
      const checkout = await createTopupCheckoutMutation.mutateAsync({
        amountCents,
        currency: WALLET_CONFIG.currency.toLowerCase(),
        idempotencyKey: crypto.randomUUID(),
      });

      window.location.assign(checkout.checkoutUrl);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to start wallet top-up.";
      setErrorMessage(message);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      setErrorMessage("You must be signed in to book a service.");
      return;
    }

    if (!providerId) {
      setErrorMessage("Provider not found.");
      return;
    }

    if (!bookingData.selectedDate || !bookingData.selectedTime) {
      setErrorMessage("Please select a date and time before continuing.");
      return;
    }

    if (!provider || provider.hourlyRate <= 0) {
      setErrorMessage(
        "This provider is not available for direct hourly booking.",
      );
      return;
    }

    if (bookingData.paymentMethod === "wallet" && !isWalletSufficient) {
      setErrorMessage(
        "Wallet balance is insufficient. Please top up to continue.",
      );
      return;
    }

    const serviceType = bookingData.service || bookingData.customService;
    if (!serviceType) {
      setErrorMessage("Please select or describe a service.");
      return;
    }

    if (requestedHours <= 0) {
      setErrorMessage("Enter valid requested hours.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const photoUrls: string[] = [];
      const validFiles = bookingData.photos.filter(
        (file): file is File => file instanceof File,
      );
      for (const file of validFiles) {
        const rawName = file.name || "upload";
        const safeName =
          rawName
            .replace(/[^a-zA-Z0-9._-]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 120) || "upload";
        const filePath = `${user.id}/${providerId}/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("job-photos")
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicData } = supabase.storage
          .from("job-photos")
          .getPublicUrl(filePath);

        if (publicData?.publicUrl) {
          photoUrls.push(publicData.publicUrl);
        }
      }

      const scheduledDate = new Date(bookingData.selectedDate);
      if (!isValidDate(scheduledDate) || !selectedDateKey) {
        setErrorMessage("Selected date is invalid. Please choose a new date.");
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.rpc("create_direct_booking", {
        p_provider_id: providerId,
        p_service_type: serviceType,
        p_description: bookingData.description ?? "",
        p_scheduled_date: selectedDateKey,
        p_scheduled_time: bookingData.selectedTime,
        p_duration_hours: requestedHours,
        p_location: { address: bookingData.address },
        p_amount: estimatedTotal,
        p_special_instructions: bookingData.description,
      });

      if (error) {
        throw error;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["client_bookings", user.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["provider_bookings", providerId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["provider_jobs_bookings", providerId],
        }),
      ]);

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(`bookingWizard:${providerId}`);
      }

      setIsSuccessOpen(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit booking.";
      setErrorMessage(message);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepComplete = (step: BookingStep): boolean => {
    switch (step) {
      case "service":
        return bookingData.service !== "" || bookingData.customService !== "";
      case "datetime":
        return (
          bookingData.selectedDate !== undefined &&
          bookingData.selectedTime !== ""
        );
      case "details":
        return bookingData.address !== "" && bookingData.description !== "";
      case "photos": {
        const hasPhotos = bookingData.photos.length > 0;
        const currentIndex = stepOrder.indexOf(currentStep);
        const photosIndex = stepOrder.indexOf("photos");
        return hasPhotos || currentIndex > photosIndex;
      }
      case "payment":
        return isWalletSufficient && !isWalletLoading;
      case "review":
        return bookingData.agreeToTerms;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    if (!provider) {
      if (providerStatus === "loading") {
        return (
          <div className="space-y-6 animate-pulse">
            <div>
              <Skeleton className="h-6 w-64" />
              <Skeleton className="mt-3 h-4 w-80" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-20 w-full" />
              ))}
            </div>
          </div>
        );
      }

      return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-600">
          {errorMessage ??
            "Provider details are unavailable right now. Please try again."}
        </div>
      );
    }

    switch (currentStep) {
      case "service":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                What service do you need?
              </h2>
              <p className="text-gray-600">
                Select from {provider.name}'s available services
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {provider.services.map((service) => (
                <button
                  key={service}
                  onClick={() =>
                    setBookingData({
                      ...bookingData,
                      service,
                      customService: "",
                    })
                  }
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    bookingData.service === service
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <p className="font-semibold text-gray-900">{service}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    ${provider.hourlyRate}/hour
                  </p>
                </button>
              ))}
            </div>

            <div className="border-t pt-6">
              <Label htmlFor="customService">
                Or describe your custom service need
              </Label>
              <Input
                id="customService"
                placeholder="e.g., Install new ceiling fan"
                value={bookingData.customService}
                onChange={(e) =>
                  setBookingData({
                    ...bookingData,
                    customService: e.target.value,
                    service: "",
                  })
                }
                className="mt-2"
              />
            </div>
          </div>
        );

      case "datetime":
        const hasExplicitAvailability =
          provider.availability.hasExplicitAvailability;
        const selectedDateStr = selectedDateKey;
        const availableSlots = availableTimeOptions;

        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                When do you need this service?
              </h2>
              <p className="text-gray-600">
                Select a date and time from {provider.name}'s availability
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendar */}
              <div>
                <Label className="mb-3 block">Select Date</Label>
                <Calendar
                  mode="single"
                  selected={bookingData.selectedDate}
                  onSelect={(date) =>
                    setBookingData((prev) => ({
                      ...prev,
                      selectedDate: date,
                      selectedTime: "",
                    }))
                  }
                  disabled={(date) => {
                    const dateStr = toDateKey(date);
                    if (!dateStr) return true;
                    if (!hasExplicitAvailability) return false;
                    const resolvedDay = resolveAvailabilityForDate(
                      provider.availability,
                      dateStr,
                    );
                    return (
                      buildAvailabilityStartTimes(
                        resolvedDay,
                        requestedHours || 0,
                      ).length === 0
                    );
                  }}
                  className="rounded-md border"
                />
                <p className="text-sm text-gray-500 mt-2">
                  {hasExplicitAvailability
                    ? "Available dates depend on the provider's schedule and your requested hours."
                    : "Provider schedule is not set. Choose a date, then enter a start time."}
                </p>
              </div>

              {/* Time Slots */}
              <div>
                <Label className="mb-3 block">
                  {hasExplicitAvailability
                    ? "Select Start Time"
                    : "Preferred Start Time"}
                </Label>
                {!bookingData.selectedDate ? (
                  <div className="text-center py-12 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>Please select a date first</p>
                  </div>
                ) : hasExplicitAvailability && availableSlots.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No available time slots for this date</p>
                  </div>
                ) : hasExplicitAvailability ? (
                  <>
                    {resolvedAvailabilityDay ? (
                      <p className="mb-3 text-sm text-gray-500">
                        {formatAvailabilitySummary(resolvedAvailabilityDay)}
                      </p>
                    ) : null}
                    <div className="grid grid-cols-2 gap-3">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.value}
                          onClick={() =>
                            setBookingData((prev) => ({
                              ...prev,
                              selectedTime: slot.value,
                            }))
                          }
                          className={`p-3 border-2 rounded-lg transition-all ${
                            bookingData.selectedTime === slot.value
                              ? "border-blue-600 bg-blue-50 text-blue-600 font-semibold"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Input
                      type="time"
                      value={bookingData.selectedTime}
                      onChange={(event) =>
                        setBookingData((prev) => ({
                          ...prev,
                          selectedTime: event.target.value,
                        }))
                      }
                    />
                    <p className="text-sm text-gray-500">
                      Choose the time you want the provider to start.
                    </p>
                  </div>
                )}

                {/* Urgency */}
                <div className="mt-6">
                  <Label className="mb-3 block">Urgency</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() =>
                        setBookingData((prev) => ({
                          ...prev,
                          urgency: "flexible",
                        }))
                      }
                      className={`p-3 border-2 rounded-lg transition-all ${
                        bookingData.urgency === "flexible"
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <p className="font-semibold">Flexible</p>
                      <p className="text-xs text-gray-600">
                        Standard scheduling
                      </p>
                    </button>
                    <button
                      onClick={() =>
                        setBookingData((prev) => ({
                          ...prev,
                          urgency: "urgent",
                        }))
                      }
                      className={`p-3 border-2 rounded-lg transition-all ${
                        bookingData.urgency === "urgent"
                          ? "border-red-600 bg-red-50"
                          : "border-gray-200 hover:border-red-300"
                      }`}
                    >
                      <p className="font-semibold text-red-600">Urgent</p>
                      <p className="text-xs text-gray-600">ASAP service</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "details":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Job Details</h2>
              <p className="text-gray-600">
                Provide information about the work needed
              </p>
            </div>

            <div>
              <Label htmlFor="address">
                Service Address <span className="text-red-600">*</span>
              </Label>
              <Input
                id="address"
                placeholder="123 Main St, Springfield"
                value={bookingData.address}
                onChange={(e) =>
                  setBookingData({ ...bookingData, address: e.target.value })
                }
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Where should the provider go?
              </p>
            </div>

            <div>
              <Label htmlFor="description">
                Job Description <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the work needed, any specific requirements, access instructions, etc."
                rows={5}
                value={bookingData.description}
                onChange={(e) =>
                  setBookingData({
                    ...bookingData,
                    description: e.target.value,
                  })
                }
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Be as detailed as possible to help the provider prepare
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="duration">Requested Hours</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0.5"
                  step="0.5"
                  placeholder="2"
                  value={bookingData.requestedHours}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      requestedHours: e.target.value,
                    })
                  }
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter the number of hours you want to book.
                </p>
              </div>

              <div>
                <Label>Pricing Summary</Label>
                <div className="rounded-lg border bg-slate-50 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Hourly rate</span>
                    <span className="font-semibold">
                      {formatCurrency(provider.hourlyRate)}/hr
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Requested hours</span>
                    <span className="font-semibold">
                      {requestedHours || 0}h
                    </span>
                  </div>
                  {minimumBillableHours > 0 ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Minimum billable</span>
                      <span className="font-semibold">
                        {minimumBillableHours}h
                      </span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Billable now</span>
                    <span className="font-semibold">{billableHours || 0}h</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-gray-900">
                      Booking total
                    </span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(estimatedTotal)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Materials stay off-platform. If actual work exceeds the
                    booked hours, the client can send a post-job bonus after
                    completion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "photos":
        return (
          <div className="space-y-6 ">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Upload Photos (Optional)
              </h2>
              <p className="text-gray-600">
                Help the provider understand the job better with photos
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setBookingData({
                    ...bookingData,
                    photos: [...bookingData.photos, ...files],
                  });
                }}
                className="hidden"
                id="photos"
              />
              <label htmlFor="photos" className="cursor-pointer">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="font-semibold text-gray-900 mb-2">
                  Click to upload photos
                </p>
                <p className="text-sm text-gray-600">
                  PNG, JPG up to 10MB each
                </p>
              </label>
            </div>

            {bookingData.photos.length > 0 && (
              <div>
                <Label className="mb-3 block">
                  {bookingData.photos.length} photo(s) uploaded
                </Label>
                <div className="flex flex-wrap gap-3">
                  {bookingData.photos.map((file, index) => (
                    <div key={index} className="group relative">
                      <div className="h-20 w-20 overflow-hidden rounded-md border border-border bg-muted">
                        {photoPreviewUrls[index] ? (
                          <img
                            src={photoPreviewUrls[index]}
                            alt={`Uploaded photo ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                            <ImageIcon className="h-5 w-5" />
                            <p className="px-2 text-center text-xs">
                              {typeof file === "string"
                                ? (file.split("/").pop() ?? file)
                                : file.name}
                            </p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          const newPhotos = bookingData.photos.filter(
                            (_, i) => i !== index,
                          );
                          setBookingData({ ...bookingData, photos: newPhotos });
                        }}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button variant="ghost" className="w-full" onClick={handleNext}>
              Skip this step
            </Button>
          </div>
        );

      case "payment":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Payment</h2>
              <p className="text-gray-600">
                Wallet is the available payment method for this booking
              </p>
            </div>

            <Card className="bg-blue-50 border border-blue-200">
              <CardContent className="pt-6 space-y-3">
                {isWalletLoading ? (
                  <p className="text-sm text-gray-700">
                    Checking wallet balance...
                  </p>
                ) : (
                  <>
                    <div className="flex items-center justify-between rounded-md border border-blue-200 bg-white px-3 py-2">
                      <span className="text-sm text-gray-600">
                        Payment Method
                      </span>
                      <span className="text-sm font-semibold text-blue-700">
                        Wallet
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Available Balance</span>
                      <span className="font-semibold">
                        {formatCurrency(availableWalletBalance)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Booking Total</span>
                      <span className="font-semibold">
                        {formatCurrency(estimatedTotal)}
                      </span>
                    </div>

                    {isWalletSufficient ? (
                      <div className="rounded-md border border-green-300 bg-green-100 px-3 py-2 text-sm text-green-800">
                        Wallet balance is sufficient for this booking.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="rounded-md border border-amber-300 bg-amber-100 px-3 py-2 text-sm text-amber-900">
                          Top-up required: {formatCurrency(walletShortfall)}
                        </div>
                        <Button
                          onClick={handleWalletTopup}
                          disabled={createTopupCheckoutMutation.isPending}
                          className="w-full"
                        >
                          {createTopupCheckoutMutation.isPending
                            ? "Redirecting..."
                            : "Top up wallet"}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case "review":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Review Your Booking</h2>
              <p className="text-gray-600">
                Please confirm all details before submitting
              </p>
            </div>

            {/* Provider Info */}
            <Card>
              <CardHeader>
                <CardTitle>Provider</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-blue-600 text-white text-xl">
                      {provider.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-lg">{provider.name}</p>
                    <p className="text-sm text-gray-600">
                      {provider.businessName}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-red-500 text-red-500" />
                      <span className="font-semibold">{provider.rating}</span>
                      <span className="text-sm text-gray-600">
                        ({provider.totalReviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Service</span>
                  <span className="font-semibold">
                    {bookingData.service || bookingData.customService}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Date</span>
                  <span className="font-semibold">
                    {bookingData.selectedDate?.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Time</span>
                  <span className="font-semibold">
                    {formatAvailabilityTimeLabel(bookingData.selectedTime)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Location</span>
                  <span className="font-semibold text-right">
                    {bookingData.address}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Requested hours</span>
                  <span className="font-semibold">{requestedHours} hours</span>
                </div>
                {minimumBillableHours > 0 ? (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Minimum billable</span>
                    <span className="font-semibold">
                      {minimumBillableHours} hours
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Billable now</span>
                  <span className="font-semibold">{billableHours} hours</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Urgency</span>
                  <Badge
                    className={
                      bookingData.urgency === "urgent"
                        ? "bg-red-600"
                        : "bg-blue-600"
                    }
                  >
                    {bookingData.urgency}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Hourly Rate</span>
                  <span>{formatCurrency(provider.hourlyRate)}/hour</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Requested Hours</span>
                  <span>{requestedHours} hours</span>
                </div>
                {minimumBillableHours > 0 ? (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Minimum Billable</span>
                    <span>{minimumBillableHours} hours</span>
                  </div>
                ) : null}
                <div className="flex justify-between py-2 border-t">
                  <span className="text-gray-600">Billable Now</span>
                  <span>{billableHours} hours</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-blue-600">
                  <span className="font-bold text-lg">Booking Total</span>
                  <span className="font-bold text-lg text-blue-600">
                    {formatCurrency(estimatedTotal)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  The provider can accept or decline any request. If the job
                  runs longer than booked, the client can send a post-job bonus.
                  Materials are always handled off-platform.
                </p>
              </CardContent>
            </Card>

            {/* Terms & Conditions */}
            <Card>
              <CardContent className="pt-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookingData.agreeToTerms}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        agreeToTerms: e.target.checked,
                      })
                    }
                    className="mt-1 h-5 w-5"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the{" "}
                    <button className="text-blue-600 hover:underline">
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <button className="text-blue-600 hover:underline">
                      Cancellation Policy
                    </button>
                    . I understand that I will be charged the final amount after
                    service completion.
                  </span>
                </label>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking submitted</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              Your booking request was sent successfully. The provider will
              confirm shortly.
            </p>
            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={() => navigate("/dashboard/client")}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsSuccessOpen(false)}
              >
                Stay here
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <div className="mx-auto w-full max-w-5xl px-4 pt-6">
        <button
          onClick={() =>
            navigate("/dashboard/client/providers/profile", {
              state: { providerId: data?.providerId },
            })
          }
          className="mb-2 flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-semibold text-foreground">Book Service</h1>
        <p className="text-sm text-muted-foreground">
          Complete the steps below to confirm your booking.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mt-4 border-y bg-card">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isComplete = isStepComplete(step.id);
              const isCurrent = getCurrentStepIndex() === index;

              return (
                <div key={step.id} className="flex flex-1 items-center">
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                        isComplete
                          ? "border-primary bg-primary text-primary-foreground"
                          : isCurrent
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <p
                      className={`mt-2 max-w-[88px] text-center text-xs ${
                        isCurrent
                          ? "font-semibold text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-2 h-0.5 flex-1 ${
                        isComplete ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        {errorMessage && (
          <Card className="mb-6 border-destructive/20 bg-destructive/5">
            <CardContent className="py-6">
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {errorMessage}
              </div>
            </CardContent>
          </Card>
        )}

        {providerStatus === "loading" && !provider && <div className="mb-6" />}

        <Card className="border-border bg-card shadow-sm">
          <CardContent className="pt-8">
            <div
              key={currentStep}
              className="transition-opacity duration-300 ease-out"
            >
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 flex gap-4 border-t pt-6">
              {getCurrentStepIndex() > 0 && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
              )}

              {currentStep !== "review" ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepComplete(currentStep)}
                  className="flex-1"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepComplete(currentStep) || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Submitting..." : "Confirm Booking"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
