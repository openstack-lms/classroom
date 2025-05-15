import { trpc } from "@/utils/trpc";
import { useParams } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function CreateCourse() {
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const utils = trpc.useContext();

  const { data: departments } = trpc.institution.getDepartments.useQuery({
    institutionId: params.institutionId as string,
  });

  const createCourse = trpc.institution.createCourse.useMutation({
    onSuccess: () => {
      utils.institution.getCourses.invalidate();
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const description = formData.get("description") as string;
    const departmentId = formData.get("departmentId") as string;
    const credits = parseInt(formData.get("credits") as string);

    try {
      await createCourse.mutateAsync({
        name,
        code,
        description,
        departmentId,
        credits,
      });
    } catch (error) {
      console.error("Failed to create course:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Course Name
        </label>
        <Input.Text
          name="name"
          id="name"
          required
          className="mt-1"
          placeholder="Enter course name"
        />
      </div>

      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Course Code
        </label>
        <Input.Text
          name="code"
          id="code"
          required
          className="mt-1"
          placeholder="Enter course code"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <Input.Text
          name="description"
          id="description"
          className="mt-1"
          placeholder="Enter course description"
        />
      </div>

      <div>
        <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Department
        </label>
        <Input.Select
          name="departmentId"
          id="departmentId"
          required
          className="mt-1"
        >
          <option value="">Select a department</option>
          {departments?.departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </Input.Select>
      </div>

      <div>
        <label htmlFor="credits" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Credits
        </label>
        <Input.Text
          type="number"
          name="credits"
          id="credits"
          required
          min="0"
          max="10"
          className="mt-1"
          placeholder="Enter number of credits"
        />
      </div>

      <Button.Primary type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Creating..." : "Create Course"}
      </Button.Primary>
    </form>
  );
} 