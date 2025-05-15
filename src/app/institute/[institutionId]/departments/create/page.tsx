'use client';

import { trpc } from '@/utils/trpc';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateDepartmentPage({ params }: { params: { institutionId: string } }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createDepartment = trpc.institution.createDepartment.useMutation({
    onSuccess: () => {
      router.push(`/institute/${params.institutionId}/departments`);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    try {
      await createDepartment.mutateAsync({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        institutionId: params.institutionId,
      });
    } catch (error) {
      console.error('Error creating department:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Create New Department</h1>
          <Button.Light onClick={() => router.back()}>
            Back to Departments
          </Button.Light>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input.Text
              label="Department Name"
              name="name"
              id="name"
              placeholder="Enter department name"
              required
            />

            <Input.Textarea
              label="Description"
              name="description"
              id="description"
              placeholder="Enter department description"
              rows={4}
            />

            <div className="flex justify-end">
              <Button.Primary
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Department'}
              </Button.Primary>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
} 