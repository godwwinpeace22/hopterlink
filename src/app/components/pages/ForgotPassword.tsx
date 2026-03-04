import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Mail } from "lucide-react";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setSent(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
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
            <CardTitle className="text-2xl">
              {sent ? "Check your email" : "Forgot your password?"}
            </CardTitle>
            <p className="text-muted-foreground">
              {sent
                ? "We've sent a password reset link to your email address."
                : "Enter your email and we'll send you a link to reset your password."}
            </p>
          </CardHeader>

          <CardContent>
            {sent ? (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <Mail className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  A reset link has been sent to{" "}
                  <span className="font-semibold text-gray-900">{email}</span>.
                  Check your inbox (and spam folder) and click the link to set a
                  new password.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="w-full text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  Didn't receive the email? Try again
                </button>
                <Link
                  to="/signin"
                  className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMessage && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                )}

                <div>
                  <Label htmlFor="email" className="mb-3">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-6"
                >
                  {isSubmitting ? "Sending…" : "Send Reset Link"}
                </Button>

                <Link
                  to="/signin"
                  className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
