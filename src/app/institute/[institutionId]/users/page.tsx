"use client";

import { useParams } from "next/navigation";
import { DataTable } from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import { HiPlus, HiPencil, HiTrash } from "react-icons/hi";

export default function UsersPage() {
  const params = useParams();
  
  // Template data
  const users = [
    { id: 1, name: "John Doe", role: "Teacher", classes: 3, status: "Active" },
    { id: 2, name: "Jane Smith", role: "Student", classes: 4, status: "Active" },
    { id: 3, name: "Bob Johnson", role: "Teacher", classes: 2, status: "Inactive" },
    { id: 4, name: "Alice Brown", role: "Student", classes: 5, status: "Active" }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-base">User Management</h2>
        <Button.Primary className="flex items-center gap-2">
          <HiPlus className="size-5" />
          Add User
        </Button.Primary>
      </div>
      
      <DataTable
        columns={[
          { header: "Name", accessor: "name" },
          { header: "Role", accessor: "role" },
          { header: "Classes", accessor: "classes" },
          { header: "Status", accessor: "status" },
          {
            header: "Actions",
            accessor: "actions",
            cell: (row: any) => (
              <div className="flex gap-2">
                <Button.Light className="p-2">
                  <HiPencil className="size-5" />
                </Button.Light>
                <Button.Light className="p-2 text-error">
                  <HiTrash className="size-5" />
                </Button.Light>
              </div>
            ),
          },
        ]}
        data={users}
      />
    </div>
  );
} 