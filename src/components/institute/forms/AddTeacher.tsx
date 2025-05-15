import { trpc } from "@/utils/trpc";
import { useParams } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useDispatch } from "react-redux";
import { closeModal } from "@/store/appSlice";
import type { RouterOutputs } from "@server/routers/_app";

type Department = RouterOutputs['institution']['getDepartments']['departments'][number];

export default function AddTeacher() {
  const params = useParams();
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const utils = trpc.useContext();

  const { data: departments } = trpc.institution.getDepartments.useQuery({
    institutionId: params.institutionId as string,
  });

  const createTeacher = trpc.institution.createTeacher.useMutation({
    onSuccess: () => {
      utils.institution.getTeachers.invalidate();
      dispatch(closeModal());
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const departmentId = formData.get("departmentId") as string;

    try {
      await createTeacher.mutateAsync({
        name,
        email,
        departmentId: departmentId || undefined,
        institutionId: params.institutionId as string,
      });
    } catch (error) {
      console.error("Failed to create teacher:", error);
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
          Teacher Name
        </label>
        <Input.Text
          name="name"
          id="name"
          required
          className="mt-1"
          placeholder="Enter teacher name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        <Input.Text
          type="email"
          name="email"
          id="email"
          required
          className="mt-1"
          placeholder="Enter teacher email"
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

      <Button.Primary type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Adding..." : "Add Teacher"}
      </Button.Primary>
    </form>
  );
} 