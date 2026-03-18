import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Upload, MapPin, DollarSign, Calendar } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@/lib/router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "../ui/page-header";
import { useServiceCategories } from "@/lib/useServiceCategories";

export function PostJob() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { categories } = useServiceCategories();
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
      setErrorMessage(t("postJob.errorSignIn"));
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
        error instanceof Error ? error.message : t("postJob.errorFallback");
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 pt-6">
      <PageHeader title={t("postJob.title")} />
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 pt-8">
            {errorMessage && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}
            {/* Job Title */}
            <div>
              <Label htmlFor="title" className="mb-2">
                {t("postJob.jobTitleLabel")}{" "}
                <span className="text-red-600">*</span>
              </Label>
              <Input
                id="title"
                placeholder={t("postJob.jobTitlePlaceholder")}
                value={jobData.title}
                onChange={(e) =>
                  setJobData({ ...jobData, title: e.target.value })
                }
                required
              />
            </div>

            {/* Service Category */}
            <div>
              <Label htmlFor="category" className="mb-2">
                {t("postJob.categoryLabel")}{" "}
                <span className="text-red-600">*</span>
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
                <option value="">{t("postJob.categoryPlaceholder")}</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Description */}
            <div>
              <Label htmlFor="description" className="mb-2">
                {t("postJob.descriptionLabel")}{" "}
                <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder={t("postJob.descriptionPlaceholder")}
                value={jobData.description}
                onChange={(e) =>
                  setJobData({ ...jobData, description: e.target.value })
                }
                rows={6}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {t("postJob.descriptionHint")}
              </p>
            </div>

            {/* Budget */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budgetType" className="mb-2">
                  {t("postJob.budgetTypeLabel")}
                </Label>
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
                  <option value="fixed">{t("postJob.budgetTypeFixed")}</option>
                  <option value="hourly">
                    {t("postJob.budgetTypeHourly")}
                  </option>
                </select>
              </div>
              <div>
                <Label htmlFor="budget" className="mb-2">
                  {t("postJob.budgetEstimateLabel")}{" "}
                  <span className="text-red-600">*</span>
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
                  {t("postJob.providersSubmitQuotes")}
                </p>
              </div>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location" className="mb-2">
                {t("postJob.jobLocationLabel")}{" "}
                <span className="text-red-600">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  placeholder={t("postJob.locationPlaceholder")}
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
                <Label htmlFor="urgency" className="mb-2">
                  {t("postJob.urgencyLevelLabel")}
                </Label>
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
                  <option value="flexible">
                    {t("postJob.urgencyFlexibleTimeline")}
                  </option>
                  <option value="urgent">
                    {t("postJob.urgencyUrgentAsap")}
                  </option>
                </select>
              </div>
              <div>
                <Label htmlFor="preferredDate" className="mb-2">
                  {t("postJob.preferredStartDateLabel")}
                </Label>
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
              <Label className="mb-2">{t("postJob.photosOptional")}</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#F7C876] transition-colors">
                <div className="text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-[#F7C876] hover:text-[#EFA055]"
                    >
                      <span>{t("postJob.uploadPhotos")}</span>
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
                    <p className="pl-1">{t("postJob.dragDrop")}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {t("postJob.fileTypesHint")}
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
            {/* <div className="bg-[#FDEFD6] border border-[#F7C876] rounded-lg p-4">
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
            </div> */}

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/dashboard/client")}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#F7C876] hover:bg-[#EFA055]"
              >
                {isSubmitting
                  ? t("postJob.submitting")
                  : t("postJob.submitGetQuotes")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
