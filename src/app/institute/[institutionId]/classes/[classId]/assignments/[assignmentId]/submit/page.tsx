'use client';

import { trpc } from '@/utils/trpc';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { MdRefresh, MdArrowBack, MdUpload } from 'react-icons/md';
import type { RouterOutputs } from "@server/routers/_app";
import { useState } from 'react';

type Assignment = NonNullable<RouterOutputs['assignment']['get']['assignment']>;
type Submission = NonNullable<RouterOutputs['assignment']['getSubmissionById']>;
type Attachment = NonNullable<RouterOutputs['assignment']['getSubmissionById']>['attachments'][number];

export default function SubmitAssignmentPage({
  params,
}: {
  params: { institutionId: string; classId: string; assignmentId: string };
}) {
  const utils = trpc.useUtils();
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: assignmentData, isLoading: isAssignmentLoading } = trpc.assignment.get.useQuery({
    id: params.assignmentId,
    classId: params.classId,
  });

  const { data: submissionData, isLoading: isSubmissionLoading } = trpc.assignment.getSubmissionById.useQuery({
    submissionId: 'current',
    assignmentId: params.assignmentId,
    classId: params.classId,
  });

  const updateSubmission = trpc.assignment.updateSubmission.useMutation({
    onSuccess: () => {
      utils.assignment.getSubmissionById.invalidate({
        submissionId: 'current',
        assignmentId: params.assignmentId,
        classId: params.classId,
      });
      setFiles([]);
      setIsSubmitting(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;

    setIsSubmitting(true);
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      // First, upload the files
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload files');
      }

      const { fileIds } = await uploadResponse.json();

      // Then, create the submission with the file IDs
      updateSubmission.mutate({
        assignmentId: params.assignmentId,
        classId: params.classId,
        submissionId: submissionData?.submission?.id || '',
        newAttachments: files.map((file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
          data: '', // This will be handled by the server
        })),
        submit: true,
      });
    } catch (error) {
      console.error('Error submitting assignment:', error);
      setIsSubmitting(false);
    }
  };

  if (isAssignmentLoading || isSubmissionLoading) {
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

  const assignment: Assignment = assignmentData.assignment;
  const submission: Submission | undefined = submissionData?.submission;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">{assignment.title}</h1>
            <p className="text-gray-600 mt-1">
              Due: {new Date(assignment.dueDate).toLocaleString()}
            </p>
          </div>
          <Button.Light
            href={`/institute/${params.institutionId}/classes/${params.classId}/assignments/${params.assignmentId}`}
          >
            <MdArrowBack className="h-4 w-4 mr-1" />
            Back to Assignment
          </Button.Light>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-2">Assignment Details</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700">{assignment.instructions}</p>
                </div>
              </div>

              {assignment.graded && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Grading Information</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Maximum Grade</p>
                      <p className="font-medium">{assignment.maxGrade} points</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Weight</p>
                      <p className="font-medium">{assignment.weight}%</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-lg font-semibold mb-2">Your Submission</h2>
                {submission ? (
                  <div className="space-y-4">
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

                    {submission.attachments.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Submitted Files</p>
                        <div className="space-y-2">
                          {submission.attachments.map((attachment: Attachment) => (
                            <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium">{attachment.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {submission.gradeReceived && (
                      <div>
                        <p className="text-sm text-gray-500">Grade Received</p>
                        <p className="font-medium">
                          {submission.gradeReceived} / {assignment.maxGrade} points
                          ({((submission.gradeReceived / assignment.maxGrade) * 100).toFixed(1)}%)
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="text-center">
                        <input
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <MdUpload className="h-5 w-5 mr-2" />
                          Select Files
                        </label>
                        <p className="mt-2 text-sm text-gray-500">
                          {files.length > 0
                            ? `${files.length} file(s) selected`
                            : 'No files selected'}
                        </p>
                      </div>
                    </div>

                    <Button.Primary
                      onClick={handleSubmit}
                      disabled={files.length === 0 || isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                    </Button.Primary>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 