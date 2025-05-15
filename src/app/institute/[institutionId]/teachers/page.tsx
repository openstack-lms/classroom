'use client';

import { trpc } from '@/utils/trpc';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useRouter } from 'next/navigation';

export default function TeachersPage({ params }: { params: { institutionId: string } }) {
  const router = useRouter();
  const { data: teachers, isLoading } = trpc.institution.getTeachers.useQuery({
    institutionId: params.institutionId,
  });

  
  const deleteTeacher = trpc.institution.deleteTeacher.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Teachers</h1>
        <Button.Primary
          onClick={() => router.push(`/institute/${params.institutionId}/teachers/create`)}
        >
          <MdAdd className="h-5 w-5 mr-2" />
          Add Teacher
        </Button.Primary>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classes
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teachers?.teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{teacher.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{teacher.department?.name || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{teacher.classes?.length || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button.Light
                      onClick={() => router.push(`/institute/${params.institutionId}/teachers/${teacher.id}/edit`)}
                      className="mr-2"
                    >
                      <MdEdit className="h-4 w-4" />
                    </Button.Light>
                    <Button.Light
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this teacher?')) {
                          deleteTeacher.mutate({ teacherId: teacher.id });
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <MdDelete className="h-4 w-4" />
                    </Button.Light>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
} 