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

export function ProviderSignup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { categories } = useServiceCategories();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    serviceCategory: "",
    experience: "",
    bio: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const experienceYears = Number.parseInt(formData.experience, 10);
      const { userId, hasSession, emailVerified } = await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
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
            phone: formData.phone,
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
              Become a Service Provider
            </CardTitle>
            <p className="text-muted-foreground">
              Start earning with your skills today
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
                  Full Name / Business Name{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John's Handyman Services"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">
                  Email Address <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="provider@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">
                  Phone Number <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="serviceCategory">
                  Primary Service Category{" "}
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
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="experience">
                  Years of Experience <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="experience"
                  type="number"
                  placeholder="5"
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
                  About Your Services <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Tell clients about your experience, skills, and what makes you unique..."
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
                  Password <span className="text-red-600">*</span>
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
                  Confirm Password <span className="text-red-600">*</span>
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
                  ? "Creating Account..."
                  : "Create Provider Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/signin")}
                  className="text-[#F7C876] hover:text-[#EFA055] font-semibold"
                >
                  Sign In
                </button>
              </p>
              <p className="text-gray-600 mt-3">
                Looking for services?{" "}
                <button
                  onClick={() => navigate("/client-signup")}
                  className="text-[#F7C876] hover:text-[#EFA055] font-semibold"
                >
                  Sign Up as Client
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
