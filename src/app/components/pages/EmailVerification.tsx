import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Mail, ArrowLeft } from "lucide-react";

export function EmailVerification() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

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
                back and sign in.
              </p>
            </div>

            <div className="space-y-3">
              <Link to="/signin" className="block">
                <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-6">
                  Go to Sign In
                </Button>
              </Link>

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
