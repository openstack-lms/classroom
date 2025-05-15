'use client';

import { useState } from 'react';
import { trpc } from '@/utils/trpc';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { MdAdd, MdPeople, MdBook, MdRefresh, MdSchool } from 'react-icons/md';
import type { RouterOutputs } from "@server/routers/_app";

type Course = NonNullable<RouterOutputs['course']['list'][number]>;

export default function CoursesPage({
  params,
}: {
  params: { institutionId: string };
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data: courses, isLoading } = trpc.course.list.useQuery({
    institutionId: params.institutionId,
  });

  const { data: departments } = trpc.department.list.useQuery({
    institutionId: params.institutionId,
  });

  const createCourse = trpc.course.create.useMutation({
    onSuccess: () => {
      utils.course.list.invalidate();
      setIsCreateOpen(false);
    },
  });

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createCourse.mutate({
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      description: formData.get('description') as string,
      credits: parseInt(formData.get('credits') as string),
      syllabus: formData.get('syllabus') as string,
      departmentId: formData.get('departmentId') as string,
      institutionId: params.institutionId,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <MdRefresh className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Courses</h1>
        <Button.Primary onClick={() => setIsCreateOpen(true)}>
          <MdAdd className="h-4 w-4 mr-2" />
          New Course
        </Button.Primary>
      </div>

      {isCreateOpen && (
        <Card className="mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Course Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Enter course name"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Course Code</label>
                <input
                  type="text"
                  name="code"
                  required
                  placeholder="Enter course code"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Credits</label>
                <input
                  type="number"
                  name="credits"
                  required
                  min="0"
                  placeholder="Enter number of credits"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Department</label>
                <select
                  name="departmentId"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select Department</option>
                  {departments?.map((department: NonNullable<RouterOutputs['department']['list'][number]>) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                required
                placeholder="Enter course description"
                className="w-full px-3 py-2 border rounded-md"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Syllabus</label>
              <textarea
                name="syllabus"
                placeholder="Enter course syllabus"
                className="w-full px-3 py-2 border rounded-md"
                rows={6}
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Button.Light onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button.Light>
              <Button.Primary type="submit" disabled={createCourse.isPending}>
                {createCourse.isPending ? "Creating..." : "Create Course"}
              </Button.Primary>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course: Course) => (
          <Card key={course.id}>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{course.name}</h3>
                <p className="text-sm text-gray-500">{course.code}</p>
                <p className="text-gray-600 mt-2">{course.description}</p>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <MdSchool className="h-4 w-4 mr-2" />
                  {course.credits} Credits
                </div>
                <div className="flex items-center">
                  <MdBook className="h-4 w-4 mr-2" />
                  {course.department.name}
                </div>
              </div>
              <div className="flex justify-end">
                <Button.Light href={`/institute/${params.institutionId}/courses/${course.id}`}>
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