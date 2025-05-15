'use client';

import { useRouter } from 'next/navigation';
import { trpc } from '@/utils/trpc';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { MdRefresh } from 'react-icons/md';
import type { RouterOutputs } from "@server/routers/_app";

type Class = NonNullable<RouterOutputs['class']['get']['class']>;

export default function EditClassPage({
  params,
}: {
  params: { institutionId: string; classId: string };
}) {
  const router = useRouter();
  const { data, isLoading } = trpc.class.get.useQuery({
    classId: params.classId,
  });

  const updateClass = trpc.class.update.useMutation({
    onSuccess: () => {
      router.push(`/institute/${params.institutionId}/classes/${params.classId}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const section = formData.get('section') as string;
    const subject = formData.get('subject') as string;

    updateClass.mutate({
      classId: params.classId,
      name,
      section,
      subject,
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

  const cls = data.class;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <h1 className="text-2xl font-bold mb-6">Edit Class</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Class Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue={cls.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Introduction to Programming"
              />
            </div>

            <div>
              <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                Section
              </label>
              <input
                type="text"
                id="section"
                name="section"
                required
                defaultValue={cls.section}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., A"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                defaultValue={cls.subject}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Computer Science"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button.Light
                type="button"
                onClick={() => router.push(`/institute/${params.institutionId}/classes/${params.classId}`)}
              >
                Cancel
              </Button.Light>
              <Button.Primary type="submit" disabled={updateClass.isPending}>
                {updateClass.isPending ? 'Saving...' : 'Save Changes'}
              </Button.Primary>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
} 