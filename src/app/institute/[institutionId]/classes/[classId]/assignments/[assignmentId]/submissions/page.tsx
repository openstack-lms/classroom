'use client';

import { trpc } from '@/utils/trpc';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { MdRefresh, MdGrade, MdDownload } from 'react-icons/md';
import type { RouterOutputs } from "@server/routers/_app";

type Assignment = NonNullable<RouterOutputs['assignment']['get']['assignment']>;
type Submission = NonNullable<RouterOutputs['assignment']['getSubmissions'][number]>;

export default function AssignmentSubmissionsPage({
  params,
}: {
  params: { institutionId: string; classId: string; assignmentId: string };
}) {
  const utils = trpc.useUtils();
  const { data: assignmentData, isLoading: isAssignmentLoading } = trpc.assignment.get.useQuery({
    id: params.assignmentId,
    classId: params.classId,
  });

  const { data: submissionsData, isLoading: isSubmissionsLoading } = trpc.assignment.getSubmissions.useQuery({
    assignmentId: params.assignmentId,
    classId: params.classId,
  });

  const updateSubmission = trpc.assignment.updateSubmissionAsTeacher.useMutation({
    onSuccess: () => {
      // Invalidate the submissions query to refresh the data
      utils.assignment.getSubmissions.invalidate({
        assignmentId: params.assignmentId,
        classId: params.classId,
      });
    },
  });

  const handleGradeSubmit = (submissionId: string, grade: number) => {
    updateSubmission.mutate({
      assignmentId: params.assignmentId,
      classId: params.classId,
      submissionId,
      gradeReceived: grade,
    });
  };

  if (isAssignmentLoading || isSubmissionsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <MdRefresh className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!assignmentData?.assignment) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Assignment Not Found</h2>
            <p className="text-gray-600">The requested assignment could not be found.</p>
          </div>
        </Card>
      </div>
    );
  }

  const assignment = assignmentData.assignment;
  const submissions = submissionsData || [];

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Submissions for {assignment.title}</h1>
            <p className="text-gray-600 mt-1">
              Due: {new Date(assignment.dueDate).toLocaleString()}
            </p>
          </div>
          <Button.Light
            href={`/institute/${params.institutionId}/classes/${params.classId}/assignments/${params.assignmentId}`}
          >
            Back to Assignment
          </Button.Light>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission: Submission) => (
                  <tr key={submission.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {submission.student.username}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(submission.submittedAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        submission.submitted ? 'bg-green-100 text-green-800' :
                        submission.returned ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {submission.submitted ? 'Submitted' : submission.returned ? 'Returned' : 'Not Submitted'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {assignment.graded ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max={assignment.maxGrade}
                            defaultValue={submission.gradeReceived || ''}
                            className="w-20 px-2 py-1 border rounded-md"
                            onChange={(e) => {
                              const grade = parseInt(e.target.value);
                              if (!isNaN(grade)) {
                                handleGradeSubmit(submission.id, grade);
                              }
                            }}
                          />
                          <span className="text-sm text-gray-500">
                            / {assignment.maxGrade}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not Graded</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button.Light
                          href={`/institute/${params.institutionId}/classes/${params.classId}/assignments/${params.assignmentId}/submissions/${submission.id}`}
                        >
                          <MdGrade className="h-4 w-4 mr-1" />
                          View
                        </Button.Light>
                        {submission.attachments[0]?.path && (
                          <Button.Light
                            href={submission.attachments[0].path}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MdDownload className="h-4 w-4 mr-1" />
                            Download
                          </Button.Light>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
} 