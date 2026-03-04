import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function SignIn() {
  const navigate = useNavigate();
  const { signIn, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    accountType: "provider" as "provider" | "client",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await signIn(formData.email, formData.password);
      await refreshProfile();

      navigate("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Sign in failed. Please try again.";
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
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <p className="text-muted-foreground">
              Welcome back! Please enter your details
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}
              {/* <div>
                <Label>I am a...</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, accountType: "client" })
                    }
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.accountType === "client"
                        ? "border-[#F7C876] bg-[#FDEFD6] text-[#F1A400]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-semibold">Client</div>
                    <div className="text-xs text-gray-600">Book services</div>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, accountType: "provider" })
                    }
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.accountType === "provider"
                        ? "border-[#F7C876] bg-[#FDEFD6] text-[#F1A400]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-semibold">Provider</div>
                    <div className="text-xs text-gray-600">Offer services</div>
                  </button>
                </div>
              </div> */}

              <div>
                <Label htmlFor="email" className="mb-3">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="password">Password</Label>
                  <button className="text-sm text-[#F7C876] hover:text-[#EFA055]">
                    Forgot password?
                  </button>
                </div>
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

              <Button
                type="submit"
                className="w-full bg-[#F7C876] hover:bg-[#EFA055] py-6"
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    New to Fixers Hive?
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/client-signup")}
                  className="w-full"
                >
                  Sign Up as Client
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/provider-signup")}
                  className="w-full"
                >
                  Sign Up as Provider
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
