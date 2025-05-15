'use client';

import { trpc } from '@/utils/trpc';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { MdRefresh, MdDownload, MdArrowBack } from 'react-icons/md';
import type { RouterOutputs } from "@server/routers/_app";

type Submission = NonNullable<RouterOutputs['assignment']['getSubmissionById']>;
type Attachment = NonNullable<RouterOutputs['assignment']['getSubmissionById']>['attachments'][number];

export default function SubmissionDetailsPage({
  params,
}: {
  params: { institutionId: string; classId: string; assignmentId: string; submissionId: string };
}) {
  const utils = trpc.useUtils();
  const { data: submissionData, isLoading } = trpc.assignment.getSubmissionById.useQuery({
    submissionId: params.submissionId,
    assignmentId: params.assignmentId,
    classId: params.classId,
  });

  const updateSubmission = trpc.assignment.updateSubmissionAsTeacher.useMutation({
    onSuccess: () => {
      utils.assignment.getSubmissionById.invalidate({
        submissionId: params.submissionId,
        assignmentId: params.assignmentId,
        classId: params.classId,
      });
    },
  });

  const handleGradeSubmit = (grade: number) => {
    updateSubmission.mutate({
      assignmentId: params.assignmentId,
      classId: params.classId,
      submissionId: params.submissionId,
      gradeReceived: grade,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <MdRefresh className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!submissionData?.submission) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Submission Not Found</h2>
            <p className="text-gray-600">The requested submission could not be found.</p>
          </div>
        </Card>
      </div>
    );
  }

  const submission: Submission = submissionData.submission;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Submission Details</h1>
            <p className="text-gray-600 mt-1">
              Student: {submission.student.username}
            </p>
          </div>
          <Button.Light
            href={`/institute/${params.institutionId}/classes/${params.classId}/assignments/${params.assignmentId}/submissions`}
          >
            <MdArrowBack className="h-4 w-4 mr-1" />
            Back to Submissions
          </Button.Light>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-2">Submission Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Submitted At</p>
                    <p className="font-medium">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      submission.submitted ? 'bg-green-100 text-green-800' :
                      submission.returned ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {submission.submitted ? 'Submitted' : submission.returned ? 'Returned' : 'Not Submitted'}
                    </span>
                  </div>
                </div>
              </div>

              {submission.attachments.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Submitted Files</h2>
                  <div className="space-y-2">
                    {submission.attachments.map((attachment: Attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">{attachment.name}</span>
                        <Button.Light
                          href={attachment.path}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MdDownload className="h-4 w-4 mr-1" />
                          Download
                        </Button.Light>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {submission.assignment.graded && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Grade</h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max={submission.assignment.maxGrade}
                        defaultValue={submission.gradeReceived || ''}
                        className="w-20 px-2 py-1 border rounded-md"
                        onChange={(e) => {
                          const grade = parseInt(e.target.value);
                          if (!isNaN(grade)) {
                            handleGradeSubmit(grade);
                          }
                        }}
                      />
                      <span className="text-sm text-gray-500">
                        / {submission.assignment.maxGrade}
                      </span>
                    </div>
                    {submission.gradeReceived && (
                      <span className="text-sm text-gray-500">
                        ({((submission.gradeReceived / submission.assignment.maxGrade) * 100).toFixed(1)}%)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 