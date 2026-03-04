import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export function ClientSignup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
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
      const { userId, hasSession } = await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        role: "client",
      });

      if (userId && hasSession) {
        await supabase.from("profiles").upsert(
          {
            id: userId,
            role: "client",
            email: formData.email,
            full_name: formData.fullName,
            phone: formData.phone,
            location: { address: formData.address },
          },
          { onConflict: "id" },
        );

        await supabase.from("client_profiles").upsert(
          {
            user_id: userId,
          },
          { onConflict: "user_id" },
        );

        const referralCode = `FH-${userId.slice(0, 8)}`;
        await supabase.from("client_rewards").upsert(
          {
            user_id: userId,
            referral_code: referralCode,
          },
          { onConflict: "user_id" },
        );

        navigate("/dashboard/client");
      } else {
        setInfoMessage(
          "Check your email to verify your account, then sign in.",
        );
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
        <Card>
          <CardHeader className="mb-4">
            <CardTitle className="text-2xl">Create Client Account</CardTitle>
            <p className="text-muted-foreground">
              Find and book trusted service providers
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
                  Full Name <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
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
                  placeholder="john@example.com"
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
                <Label htmlFor="address">
                  Address <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="123 Main St, City, Province"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
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

              <Button
                type="submit"
                className="w-full bg-[#F7C876] hover:bg-[#EFA055] py-6"
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
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
                Want to offer services?{" "}
                <button
                  onClick={() => navigate("/provider-signup")}
                  className="text-[#F7C876] hover:text-[#EFA055] font-semibold"
                >
                  Become a Provider
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
