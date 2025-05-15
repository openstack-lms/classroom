'use client';

import { trpc } from '@/utils/trpc';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { openModal } from '@/store/appSlice';
import CreateDepartment from '@/components/institute/forms/CreateDepartment';
import { useDispatch } from 'react-redux';
export default function DepartmentsPage({ params }: { params: { institutionId: string } }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: departments, isLoading } = trpc.institution.getDepartments.useQuery({
    institutionId: params.institutionId,
  });

  const deleteDepartment = trpc.institution.deleteDepartment.useMutation({
    onSuccess: () => {
      // Refresh the departments list
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
        <h1 className="text-2xl font-bold">Departments</h1>
        <Button.Primary
          onClick={() => dispatch(openModal({ body: <CreateDepartment />, header: 'Add Department' }))}
        >
          <MdAdd className="h-5 w-5 mr-2" />
          Add Department
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
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Courses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teachers
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments?.departments.map((department) => (
                <tr key={department.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{department.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{department.description || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{department.courses.length}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{department.teachers.length}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button.Light
                      onClick={() => router.push(`/institute/${params.institutionId}/departments/${department.id}/edit`)}
                      className="mr-2"
                    >
                      <MdEdit className="h-4 w-4" />
                    </Button.Light>
                    <Button.Light
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this department?')) {
                          deleteDepartment.mutate({ departmentId: department.id });
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