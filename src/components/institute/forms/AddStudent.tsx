import { trpc } from "@/utils/trpc";
import { useParams } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useDispatch } from "react-redux";
import { closeModal } from "@/store/appSlice";
import Alert from "@/components/Alert";

export default function AddStudent() {
  const params = useParams();
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const utils = trpc.useContext();

  const createStudent = trpc.institution.createStudent.useMutation({
    onSuccess: () => {
      utils.institution.getStudents.invalidate();
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

    try {
      await createStudent.mutateAsync({
        name,
        email,
        institutionId: params.institutionId as string,
      });
    } catch (error) {
      console.error("Failed to create student:", error);
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
          Student Name
        </label>
        <Input.Text
          name="name"
          id="name"
          required
          className="mt-1"
          placeholder="Enter student name"
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
          placeholder="Enter student email"
        />
      </div>

      <Button.Primary type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Adding..." : "Add Student"}
      </Button.Primary>
    </form>
  );
} 