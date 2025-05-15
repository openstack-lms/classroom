import { trpc } from "@/utils/trpc";
import { useParams } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function CreateDepartment() {
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const utils = trpc.useContext();

  const createDepartment = trpc.institution.createDepartment.useMutation({
    onSuccess: () => {
      utils.institution.getDepartments.invalidate();
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    try {
      await createDepartment.mutateAsync({
        name,
        description,
        institutionId: params.institutionId as string,
      });
    } catch (error) {
      console.error("Failed to create department:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Department Name
        </label>
        <Input.Text
          name="name"
          id="name"
          required
          className="mt-1"
          placeholder="Enter department name"
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
          placeholder="Enter department description"
        />
      </div>

      <Button.Primary type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Creating..." : "Create Department"}
      </Button.Primary>
    </form>
  );
} 