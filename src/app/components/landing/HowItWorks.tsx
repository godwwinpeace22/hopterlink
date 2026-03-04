import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent } from "../ui/card";

export function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How Fixers Hive Works
          </h2>
          <p className="text-xl text-gray-600">
            Simple, secure, and reliable for everyone
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="client" className="max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-12">
            <TabsTrigger value="client" className="text-lg py-3">
              For Clients
            </TabsTrigger>
            <TabsTrigger value="provider" className="text-lg py-3">
              For Service Providers
            </TabsTrigger>
          </TabsList>

          {/* Client Flow */}
          <TabsContent value="client" className="space-y-8">
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="relative">
                <CardContent className="pt-8 pb-6">
                  <div className=" h-11 w-11 mb-5 bg-black rounded-full flex items-center justify-center text-[#F7C876] font-bold text-xl shadow-lg">
                    1
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    Search & Discover
                  </h3>
                  <p className="text-gray-600">
                    Browse service categories or search for specific providers.
                    View ratings, availability, and pricing.
                  </p>
                </CardContent>
              </Card>

              <Card className="relative">
                <CardContent className="pt-8 pb-6">
                  <div className=" h-11 w-11 mb-5 bg-black rounded-full flex items-center justify-center text-[#F7C876] font-bold text-xl shadow-lg">
                    2
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Request & Book</h3>
                  <p className="text-gray-600">
                    Describe your job and receive quotes from available
                    providers. Choose the best fit and book instantly.
                  </p>
                </CardContent>
              </Card>

              <Card className="relative">
                <CardContent className="pt-8 pb-6">
                  <div className=" h-11 w-11 mb-5 bg-black rounded-full flex items-center justify-center text-[#F7C876] font-bold text-xl shadow-lg">
                    3
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Pay Securely</h3>
                  <p className="text-gray-600">
                    Fund your job with secure payment. Money is held in escrow
                    until work is completed to your satisfaction.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <Card className="relative">
                <CardContent className="pt-8 pb-6">
                  <div className=" h-11 w-11 mb-5 bg-black rounded-full flex items-center justify-center text-[#F7C876] font-bold text-xl shadow-lg">
                    4
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Rate & Review</h3>
                  <p className="text-gray-600">
                    Once the job is complete, rate your experience and help
                    build a trusted community.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#F7C8764D]">
                <CardContent className="pt-6 pb-6">
                  <div className="text-[#F9AC1E] font-semibold mb-2">
                    ✨ Bonus Rewards
                  </div>
                  <p className="text-gray-700 font-medium mb-2">
                    Earn 0.5% cashback on every $100 spent
                  </p>
                  <p className="text-sm text-gray-600">
                    Use rewards for future bookings or fee waivers
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Provider Flow */}
          <TabsContent value="provider" className="space-y-8">
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="relative">
                <CardContent className="pt-8 pb-6">
                  <div className="h-11 w-11 mb-5 bg-black rounded-full flex items-center justify-center text-[#F7C876] font-bold text-xl shadow-lg">
                    1
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Create Profile</h3>
                  <p className="text-gray-600">
                    Sign up, verify your credentials, and showcase your skills
                    with photos and descriptions.
                  </p>
                </CardContent>
              </Card>

              <Card className="relative">
                <CardContent className="pt-8 pb-6">
                  <div className="h-11 w-11 mb-5 bg-black rounded-full flex items-center justify-center text-[#F7C876] font-bold text-xl shadow-lg">
                    2
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    Set Availability
                  </h3>
                  <p className="text-gray-600">
                    Update your schedule up to 2 weeks in advance. Clients see
                    your availability in real-time.
                  </p>
                </CardContent>
              </Card>

              <Card className="relative">
                <CardContent className="pt-8 pb-6">
                  <div className="h-11 w-11 mb-5 bg-black rounded-full flex items-center justify-center text-[#F7C876] font-bold text-xl shadow-lg">
                    3
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    Get Job Requests
                  </h3>
                  <p className="text-gray-600">
                    Receive notifications for nearby jobs. Browse the job board
                    or wait for direct bookings.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <Card className="relative">
                <CardContent className="pt-8 pb-6">
                  <div className="h-11 w-11 mb-5 bg-black rounded-full flex items-center justify-center text-[#F7C876] font-bold text-xl shadow-lg">
                    4
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    Complete & Get Paid
                  </h3>
                  <p className="text-gray-600">
                    Finish the job, get client approval, and receive payment
                    instantly to your wallet.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#F7C8764D]">
                <CardContent className="pt-6 pb-6">
                  <div className="text-[#F9AC1E] font-semibold mb-2">
                    💰 Competitive Pricing
                  </div>
                  <p className="text-gray-700 font-medium mb-2">
                    Only 3-5% commission per job
                  </p>
                  <p className="text-sm text-gray-600">
                    Set your own prices. Earn cashback to waive future fees.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
