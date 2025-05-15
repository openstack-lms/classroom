'use client';

import { trpc } from '@/utils/trpc';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { MdRefresh, MdAssignment, MdPeople, MdAnnouncement } from 'react-icons/md';
import type { RouterOutputs } from "@server/routers/_app";

type Class = NonNullable<RouterOutputs['class']['get']['class']>;
type Announcement = NonNullable<Class['announcements'][number]>;
type Teacher = NonNullable<Class['teachers'][number]>;
type Student = NonNullable<Class['students'][number]>;

export default function ClassDetailsPage({
  params,
}: {
  params: { institutionId: string; classId: string };
}) {
  const { data, isLoading } = trpc.class.get.useQuery({
    classId: params.classId,
  });

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">{cls.name}</h1>
          <p className="text-gray-600 mt-1">
            Section {cls.section} • {cls.subject}
          </p>
        </div>
        <div className="flex space-x-4">
          <Button.Light href={`/institute/${params.institutionId}/classes/${params.classId}/edit`}>
            Edit Class
          </Button.Light>
          <Button.Primary href={`/institute/${params.institutionId}/classes/${params.classId}/assignments/new`}>
            <MdAssignment className="h-5 w-5 mr-2" />
            New Assignment
          </Button.Primary>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-lg font-semibold mb-4">Recent Announcements</h2>
            <div className="space-y-4">
              {cls.announcements.map((announcement: Announcement) => (
                <div key={announcement.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <MdAnnouncement className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-500">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      by {announcement.teacher.username}
                    </span>
                  </div>
                  <p className="text-gray-700">{announcement.remarks}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h2 className="text-lg font-semibold mb-4">Class Members</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Teachers</h3>
                <div className="space-y-2">
                  {cls.teachers.map((teacher: Teacher) => (
                    <div key={teacher.id} className="flex items-center">
                      <MdPeople className="h-5 w-5 text-gray-400 mr-2" />
                      <span>{teacher.username}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Students</h3>
                <div className="space-y-2">
                  {cls.students.map((student: Student) => (
                    <div key={student.id} className="flex items-center">
                      <MdPeople className="h-5 w-5 text-gray-400 mr-2" />
                      <span>{student.username}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 