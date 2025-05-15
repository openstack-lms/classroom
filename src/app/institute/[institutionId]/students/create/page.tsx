'use client';

import { trpc } from '@/utils/trpc';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateStudentPage({ params }: { params: { institutionId: string } }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createStudent = trpc.institution.createStudent.useMutation({
    onSuccess: () => {
      router.push(`/institute/${params.institutionId}/students`);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    try {
      await createStudent.mutateAsync({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        studentId: formData.get('studentId') as string || undefined,
        institutionId: params.institutionId,
      });
    } catch (error) {
      console.error('Error creating student:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Add New Student</h1>
          <Button.Light onClick={() => router.back()}>
            Back to Students
          </Button.Light>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input.Text
              label="Name"
              name="name"
              id="name"
              placeholder="Enter student's name"
              required
            />

            <Input.Text
              label="Email"
              name="email"
              id="email"
              type="email"
              placeholder="Enter student's email"
              required
            />

            <Input.Text
              label="Student ID"
              name="studentId"
              id="studentId"
              placeholder="Enter student ID (optional)"
            />

            <div className="flex justify-end">
              <Button.Primary
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Student'}
              </Button.Primary>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
} 