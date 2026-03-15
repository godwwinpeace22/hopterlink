import { ChevronLeft } from "lucide-react";
import { Button } from "./button";
import { useNavigate } from "@/lib/router";

interface PageHeaderProps {
  title: string;
  /** Override the back navigation target. Defaults to navigate(-1). */
  backTo?: string | number;
  /** Hide the back button entirely. */
  hideBack?: boolean;
  /** Extra content rendered on the right side of the header. */
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  backTo,
  hideBack,
  actions,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-1">
        {!hideBack && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 px-2 text-gray-600"
            onClick={() => navigate(backTo ?? -1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
