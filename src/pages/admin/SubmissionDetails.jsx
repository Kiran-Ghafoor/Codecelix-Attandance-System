import { useParams } from "react-router-dom";
import SubmissionDetailsView from "../../components/submissions/SubmissionDetailsView";
import { getSubmissionById } from "../../lib/mockData";

export default function AdminSubmissionDetails() {
  const { submissionId } = useParams();
  return (
    <SubmissionDetailsView
      submission={getSubmissionById(submissionId)}
      backTo="/admin/submissions"
      backLabel="Back to submissions"
    />
  );
}
