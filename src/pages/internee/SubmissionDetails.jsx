import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SubmissionDetailsView from "../../components/submissions/SubmissionDetailsView";
import { apiRequest } from "../../lib/api";

// The submissionId is a resource identifier — NOT proof of ownership.
// The backend verifies that the authenticated user owns this submission
// (via JWT user ID matching submission.internee) before returning data.
export default function InterneeSubmissionDetails() {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoaded(false);
      try {
        const data = await apiRequest(`/submissions/${submissionId}`);
        if (!cancelled) setSubmission(data.submission ?? null);
      } catch {
        if (!cancelled) setSubmission(null);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [submissionId]);

  if (!loaded) return null;

  return (
    <SubmissionDetailsView
      submission={submission}
      backTo="/internee/my-submissions"
      backLabel="Back to my submissions"
    />
  );
}
