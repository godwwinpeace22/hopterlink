import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "@/lib/router";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Mail, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export function EmailVerification() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const email = searchParams.get("email");

  const handleContinue = async () => {
    if (!user) {
      navigate("/signin");
      return;
    }

    try {
      setIsChecking(true);
      setStatusMessage(null);

      const {
        data: { user: freshUser },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      if (!freshUser?.email_confirmed_at) {
        setStatusMessage(
          "Your email is not verified yet. Open the link in your inbox, then try again.",
        );
        return;
      }

      navigate("/dashboard");
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Unable to confirm verification status.",
      );
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="mb-4">
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <p className="text-muted-foreground">
              We've sent a verification link to finish setting up your account.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                <Mail className="h-8 w-8 text-amber-600" />
              </div>
              {email && (
                <p className="text-sm text-gray-600 text-center">
                  A verification email was sent to{" "}
                  <span className="font-medium text-gray-900">{email}</span>.
                </p>
              )}
              <p className="text-sm text-gray-500 text-center">
                Click the link in the email to verify your account, then come
                back here to continue.
              </p>
            </div>

            <div className="space-y-3">
              {user ? (
                <Button
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-6"
                  onClick={handleContinue}
                  disabled={isChecking}
                >
                  {isChecking ? "Checking..." : "Continue"}
                </Button>
              ) : (
                <Link to="/signin" className="block">
                  <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-6">
                    Go to Sign In
                  </Button>
                </Link>
              )}

              {statusMessage ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {statusMessage}
                </p>
              ) : null}

              <div className="text-center">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs text-gray-400 text-center">
                Didn't receive the email? Check your spam folder or try signing
                up again.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
