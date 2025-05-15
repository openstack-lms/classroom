import { trpc } from "@/utils/trpc";
import { useParams } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type BulkAddType = 'students' | 'teachers';

export default function BulkAdd() {
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<BulkAddType>('students');
  const utils = trpc.useContext();

  const createStudent = trpc.institution.createStudent.useMutation();
  const createTeacher = trpc.institution.createTeacher.useMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const csvData = formData.get("csvData") as string;
    const lines = csvData.split('\n').filter(line => line.trim());

    try {
      for (const line of lines) {
        const [name, email] = line.split(',').map(item => item.trim());
        if (!name || !email) continue;

        if (type === 'students') {
          await createStudent.mutateAsync({
            name,
            email,
            institutionId: params.institutionId as string,
          });
        } else {
          await createTeacher.mutateAsync({
            name,
            email,
            institutionId: params.institutionId as string,
          });
        }
      }

      utils.institution.getStudents.invalidate();
      utils.institution.getTeachers.invalidate();
    } catch (error) {
      console.error("Failed to bulk add:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Type
        </label>
        <div className="mt-1 flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="type"
              value="students"
              checked={type === 'students'}
              onChange={(e) => setType(e.target.value as BulkAddType)}
              className="form-radio"
            />
            <span className="ml-2">Students</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="type"
              value="teachers"
              checked={type === 'teachers'}
              onChange={(e) => setType(e.target.value as BulkAddType)}
              className="form-radio"
            />
            <span className="ml-2">Teachers</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="csvData" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          CSV Data (name,email)
        </label>
        <Input.Textarea
          name="csvData"
          id="csvData"
          required
          className="mt-1"
          placeholder="John Doe,john@example.com&#10;Jane Smith,jane@example.com"
          rows={5}
        />
        <p className="mt-1 text-sm text-gray-500">
          Enter one entry per line in the format: name,email
        </p>
      </div>

      <Button.Primary type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Adding..." : `Bulk Add ${type}`}
      </Button.Primary>
    </form>
  );
} 