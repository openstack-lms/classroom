'use client';

import { trpc } from '@/utils/trpc';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { MdRefresh, MdEdit, MdDelete, MdAssignment } from 'react-icons/md';
import type { RouterOutputs } from "@server/routers/_app";

type Assignment = NonNullable<RouterOutputs['assignment']['get']['assignment']>;

export default function AssignmentDetailsPage({
  params,
}: {
  params: { institutionId: string; classId: string; assignmentId: string };
}) {
  const { data, isLoading } = trpc.assignment.get.useQuery({
    id: params.assignmentId,
    classId: params.classId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <MdRefresh className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!data?.assignment) {
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

  const assignment = data.assignment;

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
          <div className="flex space-x-4">
            <Button.Light
              href={`/institute/${params.institutionId}/classes/${params.classId}/assignments/${params.assignmentId}/edit`}
            >
              <MdEdit className="h-5 w-5 mr-2" />
              Edit
            </Button.Light>
            <Button.Light
              href={`/institute/${params.institutionId}/classes/${params.classId}/assignments/${params.assignmentId}/submissions`}
            >
              <MdAssignment className="h-5 w-5 mr-2" />
              View Submissions
            </Button.Light>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-lg font-semibold mb-4">Instructions</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{assignment.instructions}</p>
              </div>
            </Card>
          </div>

          <div>
            <Card>
              <h2 className="text-lg font-semibold mb-4">Assignment Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Type</h3>
                  <p className="mt-1">{assignment.type}</p>
                </div>
                {assignment.maxGrade && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Maximum Grade</h3>
                    <p className="mt-1">{assignment.maxGrade} points</p>
                  </div>
                )}
                {assignment.weight && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Weight</h3>
                    <p className="mt-1">{assignment.weight}%</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className="mt-1">{assignment.graded ? 'Graded' : 'Not Graded'}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 