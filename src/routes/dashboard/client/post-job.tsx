import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const PostJob = lazy(() =>
  import("@/app/components/pages/PostJob").then((m) => ({
    default: m.PostJob,
  })),
);

export const Route = createFileRoute("/dashboard/client/post-job")({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <PostJob />
    </Suspense>
  ),
});
