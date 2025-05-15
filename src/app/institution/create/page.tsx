'use client';

import { trpc } from '@/utils/trpc';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { MdRefresh, MdArrowBack } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { RouterOutputs } from "@server/routers/_app";

type CreateInstitutionResponse = RouterOutputs['institution']['create'];

export default function CreateInstitutionPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: authData, isLoading: isAuthLoading } = trpc.auth.check.useQuery();

  const createInstitution = trpc.institution.create.useMutation({
    onSuccess: (data: CreateInstitutionResponse) => {
      router.push(`/institute/${data.institute.id}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authData?.user) return;

    setIsSubmitting(true);
    try {
      await createInstitution.mutateAsync({
        name,
      });
    } catch (error) {
      console.error('Error creating institution:', error);
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <MdRefresh className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!authData?.user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please sign in to create an institution.</p>
            <Button.Primary href="/login">Sign In</Button.Primary>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Create New Institution</h1>
          <Button.Light href="/">
            <MdArrowBack className="h-4 w-4 mr-1" />
            Back to Home
          </Button.Light>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input.Text
              label="Institution Name"
              name="name"
              id="name"
              placeholder="Enter institution name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input.Textarea
              label="Description"
              name="description"
              id="description"
              placeholder="Enter institution description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />

            <div className="flex justify-end">
              <Button.Primary
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Institution'}
              </Button.Primary>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
} 