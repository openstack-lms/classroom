"use client";

import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import Card from "@/components/ui/Card";
import { HiBookOpen } from "react-icons/hi";
import Button from "@/components/ui/Button";
import Empty from "@/components/ui/Empty";
import { useEffect, useState } from "react";
import type { RouterOutputs } from "@server/routers/_app";

type Course = NonNullable<RouterOutputs['course']['list'][number]>;
type Department = RouterOutputs['department']['list'][number];
type Prerequisite = { id: string };

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const institutionId = params.institutionId as string;
  const courseId = params.courseId as string;

  const { data: courses } = trpc.course.list.useQuery({ institutionId });
  const { data: departments } = trpc.department.list.useQuery({ institutionId });
  const updateCourse = trpc.course.update.useMutation({
    onSuccess: () => {
      router.push(`/institute/${institutionId}/courses/${courseId}`);
    },
  });

  const course = courses?.find((c: Course) => c.id === courseId);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    credits: 0,
    syllabus: "",
    departmentId: "",
    prerequisites: [] as string[],
  });

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        code: course.code,
        description: course.description,
        credits: course.credits,
        syllabus: course.syllabus || "",
        departmentId: course.department.id,
        prerequisites: course.prerequisites?.map((p: Prerequisite) => p.id) || [],
      });
    }
  }, [course]);

  if (!course) {
    return (
      <div className="p-6">
        <Empty
          icon={HiBookOpen}
          title="Course Not Found"
          description="The requested course could not be found."
        />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateCourse.mutate({
      id: courseId,
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

  const handleMultiSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData((prev) => ({
      ...prev,
      prerequisites: options,
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Course</h1>
        <Button.Light href={`/institute/${institutionId}/courses/${courseId}`}>
          Cancel
        </Button.Light>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Course Name</label>
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
              <label className="block text-sm font-medium mb-2">Course Code</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Credits</label>
              <input
                type="number"
                name="credits"
                value={formData.credits}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Department</label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                {departments?.map((department: Department) => (
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
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Syllabus</label>
            <textarea
              name="syllabus"
              value={formData.syllabus}
              onChange={handleChange}
              rows={8}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Prerequisites</label>
            <select
              multiple
              value={formData.prerequisites}
              onChange={handleMultiSelect}
              className="w-full px-3 py-2 border rounded-md"
            >
              {courses?.map((c: Course) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            <Button.Light
              type="button"
              onClick={() => router.push(`/institute/${institutionId}/courses/${courseId}`)}
            >
              Cancel
            </Button.Light>
            <Button.Primary type="submit" disabled={updateCourse.isPending}>
              {updateCourse.isPending ? "Saving..." : "Save Changes"}
            </Button.Primary>
          </div>
        </form>
      </Card>
    </div>
  );
} 