import { trpc } from "@/utils/trpc";
import { useParams } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useDispatch } from "react-redux";
import { closeModal } from "@/store/appSlice";
import type { RouterOutputs } from "@server/routers/_app";
import { TRPCClientError } from "@trpc/client";

type Department = RouterOutputs['institution']['getDepartments']['departments'][number];
type Course = RouterOutputs['institution']['getCourses']['courses'][number];

export default function AddClass() {
  const params = useParams();
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const utils = trpc.useContext();

  const { data: departments } = trpc.institution.getDepartments.useQuery({
    institutionId: params.institutionId as string,
  });

  const { data: courses } = trpc.institution.getCourses.useQuery({
    institutionId: params.institutionId as string,
  });

  const addClass = trpc.institution.addClass.useMutation({
    onSuccess: () => {
      utils.institution.getClasses.invalidate();
      dispatch(closeModal());
    },
    onError: (error: TRPCClientError<any>) => {
      setError(error.message);
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const departmentId = formData.get("departmentId") as string;
    const courseId = formData.get("courseId") as string;
    const capacity = parseInt(formData.get("capacity") as string);

    try {
      await addClass.mutateAsync({
        name,
        departmentId: departmentId || undefined,
        courseId: courseId || undefined,
        capacity,
        institutionId: params.institutionId as string,
      });
    } catch (error) {
      console.error("Failed to create class:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Class Name
        </label>
        <Input.Text
          name="name"
          id="name"
          required
          className="mt-1"
          placeholder="Enter class name"
        />
      </div>

      <div>
        <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Department (Optional)
        </label>
        <Input.Select
          name="departmentId"
          id="departmentId"
          className="mt-1"
        >
          <option value="">Select a department</option>
          {departments?.departments.map((department: Department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </Input.Select>
      </div>

      <div>
        <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Course (Optional)
        </label>
        <Input.Select
          name="courseId"
          id="courseId"
          className="mt-1"
        >
          <option value="">Select a course</option>
          {courses?.courses.map((course: Course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </Input.Select>
      </div>

      <div>
        <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Capacity
        </label>
        <Input.Text
          type="number"
          name="capacity"
          id="capacity"
          required
          min="1"
          className="mt-1"
          placeholder="Enter class capacity"
        />
      </div>

      <Button.Primary type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Adding..." : "Add Class"}
      </Button.Primary>
    </form>
  );
} 