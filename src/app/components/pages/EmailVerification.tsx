import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "@/lib/router";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";

export function EmailVerification() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const email = searchParams.get("email");
  const { t } = useTranslation();

  // When the user clicks the link in their email, Supabase redirects back here
  // with access_token + refresh_token in the URL hash. Set the session so
  // onAuthStateChange fires SIGNED_IN, then navigate to the dashboard.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash.slice(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");

    if (accessToken && refreshToken && type === "signup") {
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error }) => {
          if (!error) {
            // Clear the hash so it's not re-processed on back-navigation
            window.history.replaceState(
              null,
              "",
              window.location.pathname + window.location.search,
            );
            navigate("/dashboard");
          } else {
            setStatusMessage("Verification failed. Please try signing in.");
          }
        });
    }
  }, [navigate]);

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
        setStatusMessage(t("emailVerification.notVerified"));
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
            <CardTitle className="text-2xl">
              {t("emailVerification.title")}
            </CardTitle>
            <p className="text-muted-foreground">
              {t("emailVerification.subtitle")}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                <Mail className="h-8 w-8 text-amber-600" />
              </div>
              {email && (
                <p className="text-sm text-gray-600 text-center">
                  {t("emailVerification.sentTo", { email })}
                </p>
              )}
              <p className="text-sm text-gray-500 text-center">
                {t("emailVerification.instruction")}
              </p>
            </div>

            <div className="space-y-3">
              {user ? (
                <Button
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-6"
                  onClick={handleContinue}
                  disabled={isChecking}
                >
                  {isChecking
                    ? t("emailVerification.checking")
                    : t("emailVerification.continueButton")}
                </Button>
              ) : (
                <Link to="/signin" className="block">
                  <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-6">
                    {t("emailVerification.goToSignIn")}
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
