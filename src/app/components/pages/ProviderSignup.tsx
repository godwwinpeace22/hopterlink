import { useNavigate } from "@/lib/router";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
// import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { SignupTabs } from "./SignupTabs";
import { useServiceCategories } from "@/lib/useServiceCategories";
import { useTranslation } from "react-i18next";
import { useAllowedCountries } from "@/app/hooks/useAllowedCountries";
import {
  getCurrencyForCountry,
  normalizeCountryCode,
} from "@/app/lib/countryConfig";
import { useEffect } from "react";

export function ProviderSignup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { categories } = useServiceCategories();
  const { t } = useTranslation();
  const { allowedCountries, isLoading: countriesLoading } =
    useAllowedCountries();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    serviceCategory: "",
    experience: "",
    bio: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (formData.country) {
      return;
    }

    const firstCountry = allowedCountries[0]?.code;
    if (!firstCountry) {
      return;
    }

    setFormData((prev) => ({ ...prev, country: firstCountry }));
  }, [allowedCountries, formData.country]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage(t("providerSignup.passwordMismatch"));
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMessage(t("providerSignup.phoneRequired"));
      return;
    }

    const country = normalizeCountryCode(formData.country);
    if (!country) {
      setErrorMessage(t("providerSignup.countryRequired"));
      return;
    }

    const currency = getCurrencyForCountry(country);

    setIsSubmitting(true);
    try {
      const experienceYears = Number.parseInt(formData.experience, 10);
      const { userId, hasSession, emailVerified } = await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone.trim(),
        country,
        role: "provider",
        businessName: formData.fullName,
        category: formData.serviceCategory,
        bio: formData.bio,
        experienceYears: Number.isNaN(experienceYears) ? 0 : experienceYears,
      });

      if (userId && hasSession && emailVerified) {
        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            id: userId,
            role: "provider",
            email: formData.email,
            full_name: formData.fullName,
            phone: formData.phone.trim(),
            country,
            currency,
          },
          { onConflict: "id" },
        );

        if (profileError) {
          throw profileError;
        }

        const { error: providerProfileError } = await supabase
          .from("provider_profiles")
          .upsert(
            {
              user_id: userId,
              country,
              currency,
              business_name: formData.fullName,
              bio: formData.bio,
              services: [formData.serviceCategory],
              experience_years: Number.isNaN(experienceYears)
                ? 0
                : experienceYears,
              verification_status: "not_started",
            },
            { onConflict: "user_id" },
          );

        if (providerProfileError) {
          throw providerProfileError;
        }

        navigate("/provider/onboarding");
      } else {
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Signup failed. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <SignupTabs />
        <Card>
          <CardHeader className="mb-4">
            <CardTitle className="text-2xl">
              {t("providerSignup.title")}
            </CardTitle>
            <p className="text-muted-foreground">
              {t("providerSignup.subtitle")}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}
              {infoMessage && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  {infoMessage}
                </div>
              )}
              <div>
                <Label htmlFor="fullName">
                  {t("providerSignup.fullName")}{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder={t("providerSignup.fullNamePlaceholder")}
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="country">
                  {t("providerSignup.country")}{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <select
                  id="country"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  disabled={countriesLoading}
                  required
                >
                  {countriesLoading ? (
                    <option value="">
                      {t("providerSignup.loadingCountries")}
                    </option>
                  ) : (
                    allowedCountries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))
                  )}
                </select>
                {formData.country && (
                  <p className="mt-1 text-xs text-gray-500">
                    {t("providerSignup.currencyHint", {
                      currency: getCurrencyForCountry(formData.country),
                    })}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email">
                  {t("providerSignup.emailLabel")}{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("providerSignup.emailPlaceholder")}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">
                  {t("providerSignup.phone")}{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t("providerSignup.phonePlaceholder")}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="serviceCategory">
                  {t("providerSignup.serviceCategory")}{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <select
                  id="serviceCategory"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.serviceCategory}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      serviceCategory: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">
                    {t("providerSignup.serviceCategoryPlaceholder")}
                  </option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="experience">
                  {t("providerSignup.experience")}{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="experience"
                  type="number"
                  placeholder={t("providerSignup.experiencePlaceholder")}
                  min="0"
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="bio">
                  {t("providerSignup.bio")}{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="bio"
                  placeholder={t("providerSignup.bioPlaceholder")}
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">
                  {t("providerSignup.password")}{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">
                  {t("providerSignup.confirmPassword")}{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>

              {/* <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">!</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong className="text-red-600">Next steps:</strong> After
                    creating your account, you'll need to upload ID, proof of
                    insurance, and complete background verification before
                    accepting jobs.
                  </p>
                </div>
              </div> */}

              <Button
                type="submit"
                className="w-full bg-[#F7C876] hover:bg-[#EFA055] py-6"
              >
                {isSubmitting
                  ? t("providerSignup.submitting")
                  : t("providerSignup.button")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {t("providerSignup.alreadyHaveAccount")}{" "}
                <button
                  onClick={() => navigate("/signin")}
                  className="text-[#F7C876] hover:text-[#EFA055] font-semibold"
                >
                  {t("providerSignup.signInLink")}
                </button>
              </p>
              <p className="text-gray-600 mt-3">
                {t("providerSignup.lookingForServices")}{" "}
                <button
                  onClick={() => navigate("/client-signup")}
                  className="text-[#F7C876] hover:text-[#EFA055] font-semibold"
                >
                  {t("providerSignup.signUpAsClient")}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
