'use client';

import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/utils/trpc';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { MdRefresh } from 'react-icons/md';
import type { RouterOutputs } from "@server/routers/_app";

type Course = NonNullable<RouterOutputs['course']['list'][number]>;

export default function CreateClassPage() {
  const params = useParams();
  const router = useRouter();
  const institutionId = params.institutionId as string;
  const courseId = params.courseId as string;

  const { data: course, isLoading: isCourseLoading } = trpc.course.list.useQuery({
    institutionId,
  });

  const createClass = trpc.class.create.useMutation({
    onSuccess: () => {
      router.push(`/institute/${institutionId}/courses/${courseId}`);
    },
  });

  const selectedCourse = course?.find((c: Course) => c.id === courseId);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createClass.mutate({
      name: formData.get('name') as string,
      section: formData.get('section') as string,
      subject: formData.get('subject') as string,
    });
  };

  if (isCourseLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <MdRefresh className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!selectedCourse) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Course Not Found</h2>
            <p className="text-gray-600">The requested course could not be found.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Create New Class</h1>
          <p className="text-gray-600 mt-1">Course: {selectedCourse.name}</p>
        </div>
        <Button.Light href={`/institute/${institutionId}/courses/${courseId}`}>
          Cancel
        </Button.Light>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Class Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="Enter class name"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Section</label>
              <input
                type="text"
                name="section"
                required
                placeholder="Enter section (e.g., A, B, 1, 2)"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                required
                placeholder="Enter subject"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button.Light
              type="button"
              onClick={() => router.push(`/institute/${institutionId}/courses/${courseId}`)}
            >
              Cancel
            </Button.Light>
            <Button.Primary type="submit" disabled={createClass.isPending}>
              {createClass.isPending ? "Creating..." : "Create Class"}
            </Button.Primary>
          </div>
        </form>
      </Card>
    </div>
  );
} 