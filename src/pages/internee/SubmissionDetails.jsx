import { useParams } from "react-router-dom";
import SubmissionDetailsView from "../../components/submissions/SubmissionDetailsView";
import { useAuth } from "../../context/AuthContext";
import { getSubmissionById } from "../../lib/mockData";

// The submissionId is a resource identifier — NOT proof of ownership.
// The backend must verify that the authenticated user owns this submission
// (via JWT user ID matching submission.interneeId) before returning data.
// The frontend ownership check below is a UX guard only.
export default function InterneeSubmissionDetails() {
  const { user } = useAuth();
  const { submissionId } = useParams();
  const submission = getSubmissionById(submissionId);

  const owned = submission && user && submission.interneeId === user.id ? submission : null;

  return (
    <SubmissionDetailsView
      submission={owned}
      backTo="/internee/my-submissions"
      backLabel="Back to my submissions"
    />
  );
}
