import { useParams } from "react-router-dom";
import { JobDetails } from "../../JobDetails";

export const ClientJobDetails = () => {
  const { jobId } = useParams();

  return <JobDetails embedded jobId={jobId ?? null} />;
};
