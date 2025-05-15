"use client";

import { trpc } from '@/utils/trpc';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { MdAdd, MdRefresh } from 'react-icons/md';
import type { RouterOutputs } from "@server/routers/_app";

type Class = NonNullable<RouterOutputs['class']['getAll']['teacherInClass'][number]>;

export default function ClassesPage({
  params,
}: {
  params: { institutionId: string };
}) {
  const { data, isLoading } = trpc.class.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <MdRefresh className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const classes = [...(data?.teacherInClass || []), ...(data?.studentInClass || [])];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Classes</h1>
          <p className="text-gray-600 mt-1">Manage your institution's classes</p>
        </div>
        <Button.Primary href={`/institute/${params.institutionId}/classes/new`}>
          <MdAdd className="h-5 w-5 mr-2" />
          New Class
        </Button.Primary>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls: Class) => (
          <Card key={cls.id}>
            <div className="flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="text-lg font-semibold mb-2">{cls.name}</h3>
                <p className="text-gray-600 mb-2">Section: {cls.section}</p>
                <p className="text-gray-600 mb-4">Subject: {cls.subject}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>{cls.dueToday.length} assignments due today</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button.Light
                  href={`/institute/${params.institutionId}/classes/${cls.id}`}
                  className="w-full"
                >
                  View Details
                </Button.Light>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 