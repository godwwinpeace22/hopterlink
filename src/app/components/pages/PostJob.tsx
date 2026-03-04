import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ArrowLeft, Upload, MapPin, DollarSign, Calendar } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface PostJobProps {
  embedded?: boolean;
}

export function PostJob({ embedded = false }: PostJobProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobData, setJobData] = useState({
    title: "",
    category: "",
    description: "",
    budget: "",
    budgetType: "fixed" as "fixed" | "hourly",
    location: "",
    urgency: "flexible" as "urgent" | "flexible",
    preferredDate: "",
    photos: [] as File[],
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setJobData({
        ...jobData,
        photos: [...jobData.photos, ...Array.from(e.target.files)],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!user?.id) {
      setErrorMessage("You must be signed in to post a job.");
      return;
    }

    setIsSubmitting(true);
    try {
      const photoUrls: string[] = [];

      for (const file of jobData.photos) {
        const filePath = `${user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("job-photos")
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicData } = supabase.storage
          .from("job-photos")
          .getPublicUrl(filePath);

        if (publicData?.publicUrl) {
          photoUrls.push(publicData.publicUrl);
        }
      }

      const budgetValue = Number.parseFloat(jobData.budget);

      const { error } = await supabase.from("jobs").insert({
        client_id: user.id,
        title: jobData.title,
        description: jobData.description,
        category: jobData.category,
        location: {
          address: jobData.location,
        },
        urgency: jobData.urgency,
        budget_min: Number.isNaN(budgetValue) ? null : budgetValue,
        budget_max: Number.isNaN(budgetValue) ? null : budgetValue,
        preferred_date: jobData.preferredDate
          ? new Date(jobData.preferredDate).toISOString()
          : null,
        photo_urls: photoUrls,
        status: "open",
        metadata: {
          budgetType: jobData.budgetType,
        },
      });

      if (error) {
        throw error;
      }

      navigate("/dashboard/client/my-jobs");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to post job.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <div className={embedded ? "" : "max-w-4xl mx-auto"}>
      {!embedded && (
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/dashboard/client")}
            className="flex items-center gap-2 text-gray-600 hover:text-[#F7C876] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Post a New Job</CardTitle>
          <p className="text-gray-600">
            Describe your service need and receive quotes from qualified
            providers
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}
            {/* Job Title */}
            <div>
              <Label htmlFor="title">
                Job Title <span className="text-red-600">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Need landscaping for backyard"
                value={jobData.title}
                onChange={(e) =>
                  setJobData({ ...jobData, title: e.target.value })
                }
                required
              />
            </div>

            {/* Service Category */}
            <div>
              <Label htmlFor="category">
                Service Category <span className="text-red-600">*</span>
              </Label>
              <select
                id="category"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={jobData.category}
                onChange={(e) =>
                  setJobData({ ...jobData, category: e.target.value })
                }
                required
              >
                <option value="">Select a category</option>
                <option value="snow-clearing">Snow Clearing</option>
                <option value="landscaping">Landscaping</option>
                <option value="cleaning">Cleaning Services</option>
                <option value="handyman">Handyman</option>
                <option value="painting">Painting</option>
                <option value="auto">Auto Services</option>
                <option value="childcare">Childcare</option>
                <option value="tutoring">Tutoring</option>
                <option value="moving">Moving Help</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Job Description */}
            <div>
              <Label htmlFor="description">
                Job Description <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the work needed, any specific requirements, materials, timeline, etc."
                value={jobData.description}
                onChange={(e) =>
                  setJobData({ ...jobData, description: e.target.value })
                }
                rows={6}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Be as detailed as possible to receive accurate quotes
              </p>
            </div>

            {/* Budget */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budgetType">Budget Type</Label>
                <select
                  id="budgetType"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={jobData.budgetType}
                  onChange={(e) =>
                    setJobData({
                      ...jobData,
                      budgetType: e.target.value as "fixed" | "hourly",
                    })
                  }
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="hourly">Hourly Rate</option>
                </select>
              </div>
              <div>
                <Label htmlFor="budget">
                  Estimated Budget <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="budget"
                    type="number"
                    placeholder="500"
                    className="pl-10"
                    value={jobData.budget}
                    onChange={(e) =>
                      setJobData({ ...jobData, budget: e.target.value })
                    }
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Providers will submit their own quotes
                </p>
              </div>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">
                Job Location <span className="text-red-600">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  placeholder="Address or city"
                  className="pl-10"
                  value={jobData.location}
                  onChange={(e) =>
                    setJobData({ ...jobData, location: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Urgency & Date */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="urgency">Urgency Level</Label>
                <select
                  id="urgency"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={jobData.urgency}
                  onChange={(e) =>
                    setJobData({
                      ...jobData,
                      urgency: e.target.value as "urgent" | "flexible",
                    })
                  }
                >
                  <option value="flexible">Flexible Timeline</option>
                  <option value="urgent">Urgent (ASAP)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="preferredDate">Preferred Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="preferredDate"
                    type="date"
                    className="pl-10"
                    value={jobData.preferredDate}
                    onChange={(e) =>
                      setJobData({
                        ...jobData,
                        preferredDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <Label>Photos (Optional)</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#F7C876] transition-colors">
                <div className="text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-[#F7C876] hover:text-[#EFA055]"
                    >
                      <span>Upload photos</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
                {jobData.photos.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {jobData.photos.map((photo, index) => (
                      <Badge key={index} variant="secondary">
                        {photo.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-[#FDEFD6] border border-[#F7C876] rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 bg-[#F7C876] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-gray-900 mb-1">
                    What happens next?
                  </p>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Qualified providers in your area will be notified</li>
                    <li>• You'll receive quotes within 24 hours</li>
                    <li>• Review providers' profiles, ratings, and quotes</li>
                    <li>• Message providers to discuss details</li>
                    <li>• Select your preferred provider and fund the job</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/dashboard/client")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#F7C876] hover:bg-[#EFA055]"
              >
                {isSubmitting ? "Posting..." : "Post Job & Get Quotes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  if (embedded) {
    return content;
  }

  return <div className="min-h-screen bg-gray-50 py-8 px-4">{content}</div>;
}
