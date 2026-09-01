import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SubmissionDetailsView from "../../components/submissions/SubmissionDetailsView";
import { useInternees } from "../../context/InterneesContext";
import { apiRequest } from "../../lib/api";

export default function AdminSubmissionDetails() {
  const { submissionId } = useParams();
  const { internees: roster } = useInternees();
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
      roster={roster}
      backTo="/admin/submissions"
      backLabel="Back to submissions"
    />
  );
}
