"use client";

import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import Card from "@/components/ui/Card";
import { HiOfficeBuilding } from "react-icons/hi";
import Button from "@/components/ui/Button";
import Empty from "@/components/ui/Empty";
import { useEffect, useState } from "react";
import type { RouterOutputs } from "@server/routers/_app";

type Department = NonNullable<RouterOutputs['department']['list'][number]>;
type Teacher = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export default function EditDepartmentPage() {
  const params = useParams();
  const router = useRouter();
  const institutionId = params.institutionId as string;
  const departmentId = params.departmentId as string;

  const { data: departments } = trpc.department.list.useQuery({ institutionId });
  const { data: institution } = trpc.institution.get.useQuery({ institutionId });
  const updateDepartment = trpc.department.update.useMutation({
    onSuccess: () => {
      router.push(`/institute/${institutionId}/departments/${departmentId}`);
    },
  });

  const department = departments?.find((d: Department) => d.id === departmentId);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    headId: "",
  });

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name,
        description: department.description,
        headId: department.head?.id || "",
      });
    }
  }, [department]);

  if (!department) {
    return (
      <div className="p-6">
        <Empty
          icon={HiOfficeBuilding}
          title="Department Not Found"
          description="The requested department could not be found."
        />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateDepartment.mutate({
      id: departmentId,
      institutionId,
      ...formData,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Department</h1>
        <Button.Light href={`/institute/${institutionId}/departments/${departmentId}`}>
          Cancel
        </Button.Light>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Department Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Department Head</label>
            <select
              name="headId"
              value={formData.headId}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select Department Head</option>
              {institution?.teachers.map((teacher: Teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName} ({teacher.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            <Button.Light
              type="button"
              onClick={() => router.push(`/institute/${institutionId}/departments/${departmentId}`)}
            >
              Cancel
            </Button.Light>
            <Button.Primary type="submit" disabled={updateDepartment.isPending}>
              {updateDepartment.isPending ? "Saving..." : "Save Changes"}
            </Button.Primary>
          </div>
        </form>
      </Card>
    </div>
  );
} 