'use client';

import { useRouter } from 'next/navigation';
import { trpc } from '@/utils/trpc';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { MdRefresh } from 'react-icons/md';
import type { RouterOutputs } from "@server/routers/_app";

type Class = NonNullable<RouterOutputs['class']['get']['class']>;

export default function CreateAssignmentPage({
  params,
}: {
  params: { institutionId: string; classId: string };
}) {
  const router = useRouter();
  const { data, isLoading } = trpc.class.get.useQuery({
    classId: params.classId,
  });

  const createAssignment = trpc.assignment.create.useMutation({
    onSuccess: () => {
      router.push(`/institute/${params.institutionId}/classes/${params.classId}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const instructions = formData.get('instructions') as string;
    const dueDate = formData.get('dueDate') as string;
    const maxGrade = parseInt(formData.get('maxGrade') as string) || undefined;
    const graded = formData.get('graded') === 'true';
    const weight = parseInt(formData.get('weight') as string) || undefined;
    const type = formData.get('type') as 'HOMEWORK' | 'QUIZ' | 'TEST' | 'PROJECT' | 'ESSAY' | 'DISCUSSION' | 'PRESENTATION' | 'LAB' | 'OTHER';

    createAssignment.mutate({
      classId: params.classId,
      title,
      instructions,
      dueDate,
      maxGrade,
      graded,
      weight,
      type,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <MdRefresh className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!data?.class) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Class Not Found</h2>
            <p className="text-gray-600">The requested class could not be found.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <h1 className="text-2xl font-bold mb-6">Create New Assignment</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Week 1 Programming Exercise"
              />
            </div>

            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
                Instructions
              </label>
              <textarea
                id="instructions"
                name="instructions"
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter assignment instructions..."
              />
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="datetime-local"
                id="dueDate"
                name="dueDate"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                id="type"
                name="type"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="HOMEWORK">Homework</option>
                <option value="QUIZ">Quiz</option>
                <option value="TEST">Test</option>
                <option value="PROJECT">Project</option>
                <option value="ESSAY">Essay</option>
                <option value="DISCUSSION">Discussion</option>
                <option value="PRESENTATION">Presentation</option>
                <option value="LAB">Lab</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="maxGrade" className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Grade
              </label>
              <input
                type="number"
                id="maxGrade"
                name="maxGrade"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 100"
              />
            </div>

            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                Weight
              </label>
              <input
                type="number"
                id="weight"
                name="weight"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 20"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="graded"
                name="graded"
                value="true"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="graded" className="ml-2 block text-sm text-gray-700">
                This assignment will be graded
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <Button.Light
                type="button"
                onClick={() => router.push(`/institute/${params.institutionId}/classes/${params.classId}`)}
              >
                Cancel
              </Button.Light>
              <Button.Primary type="submit" disabled={createAssignment.isPending}>
                {createAssignment.isPending ? 'Creating...' : 'Create Assignment'}
              </Button.Primary>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
} 