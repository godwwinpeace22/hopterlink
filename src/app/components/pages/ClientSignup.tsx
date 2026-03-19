import { useNavigate } from "@/lib/router";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { SignupTabs } from "./SignupTabs";
import { useTranslation } from "react-i18next";
import { useAllowedCountries } from "@/app/hooks/useAllowedCountries";
import {
  getDialCodeForCountry,
  getCurrencyForCountry,
  normalizeCountryCode,
  withCountryDialCode,
} from "@/app/lib/countryConfig";
import { useEffect } from "react";

export function ClientSignup() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const { allowedCountries, isLoading: countriesLoading } =
    useAllowedCountries();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    address: "",
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
      setErrorMessage(t("clientSignup.passwordMismatch"));
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMessage(t("clientSignup.phoneRequired"));
      return;
    }

    const country = normalizeCountryCode(formData.country);
    if (!country) {
      setErrorMessage(t("clientSignup.countryRequired"));
      return;
    }

    const normalizedPhone = withCountryDialCode(formData.phone, country);

    const currency = getCurrencyForCountry(country);

    setIsSubmitting(true);
    try {
      const { userId, hasSession, emailVerified } = await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: normalizedPhone,
        country,
        role: "client",
        address: formData.address,
      });

      if (userId && hasSession && emailVerified) {
        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            id: userId,
            role: "client",
            email: formData.email,
            full_name: formData.fullName,
            phone: normalizedPhone,
            country,
            currency,
            location: { address: formData.address },
          },
          { onConflict: "id" },
        );

        if (profileError) {
          throw profileError;
        }

        const { error: clientProfileError } = await supabase
          .from("client_profiles")
          .upsert(
            {
              user_id: userId,
              country,
              currency,
            },
            { onConflict: "user_id" },
          );

        if (clientProfileError) {
          throw clientProfileError;
        }

        const referralCode = `FH-${userId.slice(0, 8)}`;
        const { error: clientRewardsError } = await supabase
          .from("client_rewards")
          .upsert(
            {
              user_id: userId,
              referral_code: referralCode,
            },
            { onConflict: "user_id" },
          );

        if (clientRewardsError) {
          throw clientRewardsError;
        }

        navigate("/dashboard/client");
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
              {t("clientSignup.title")}
            </CardTitle>
            <p className="text-muted-foreground">
              {t("clientSignup.subtitle")}
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
                  {t("clientSignup.fullName")}{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder={t("clientSignup.fullNamePlaceholder")}
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="country">
                  {t("clientSignup.country")}{" "}
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
                      {t("clientSignup.loadingCountries")}
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
                    {t("clientSignup.currencyHint", {
                      currency: getCurrencyForCountry(formData.country),
                    })}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email">
                  {t("clientSignup.emailLabel")}{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("clientSignup.emailPlaceholder")}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">
                  {t("clientSignup.phone")}{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={`${getDialCodeForCountry(formData.country || "CA")} 555 123 4567`}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
                {formData.country && (
                  <p className="mt-1 text-xs text-gray-500">
                    Dial code: {getDialCodeForCountry(formData.country)}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="address">
                  {t("clientSignup.address")}{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="address"
                  type="text"
                  placeholder={t("clientSignup.addressPlaceholder")}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">
                  {t("clientSignup.password")}{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("clientSignup.passwordPlaceholder")}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">
                  {t("clientSignup.confirmPassword")}{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t("clientSignup.confirmPasswordPlaceholder")}
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

              <Button
                type="submit"
                className="w-full bg-[#F7C876] hover:bg-[#EFA055] py-6"
              >
                {isSubmitting
                  ? t("clientSignup.submitting")
                  : t("clientSignup.button")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {t("clientSignup.alreadyHaveAccount")}{" "}
                <button
                  onClick={() => navigate("/signin")}
                  className="text-[#F7C876] hover:text-[#EFA055] font-semibold"
                >
                  {t("clientSignup.signInLink")}
                </button>
              </p>
              <p className="text-gray-600 mt-3">
                {t("clientSignup.wantToOffer")}{" "}
                <button
                  onClick={() => navigate("/provider-signup")}
                  className="text-[#F7C876] hover:text-[#EFA055] font-semibold"
                >
                  {t("clientSignup.becomeProvider")}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
