'use client';

import { trpc } from '@/utils/trpc';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateTeacherPage({ params }: { params: { institutionId: string } }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: departments } = trpc.institution.getDepartments.useQuery({
    institutionId: params.institutionId,
  });

  const createTeacher = trpc.institution.createTeacher.useMutation({
    onSuccess: () => {
      router.push(`/institute/${params.institutionId}/teachers`);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    try {
      await createTeacher.mutateAsync({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        departmentId: formData.get('departmentId') as string || undefined,
        institutionId: params.institutionId,
      });
    } catch (error) {
      console.error('Error creating teacher:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Add New Teacher</h1>
          <Button.Light onClick={() => router.back()}>
            Back to Teachers
          </Button.Light>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input.Text
              label="Name"
              name="name"
              id="name"
              placeholder="Enter teacher's name"
              required
            />

            <Input.Text
              label="Email"
              name="email"
              id="email"
              type="email"
              placeholder="Enter teacher's email"
              required
            />

            <Input.Select
              label="Department"
              name="departmentId"
              id="departmentId"
            >
              <option value="">Select a department (optional)</option>
              {departments?.departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </Input.Select>

            <div className="flex justify-end">
              <Button.Primary
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Teacher'}
              </Button.Primary>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
} 