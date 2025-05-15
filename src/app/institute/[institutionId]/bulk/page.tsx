"use client";

import { useParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { HiUpload, HiDownload, HiArchive } from "react-icons/hi";

export default function BulkOperationsPage() {  
  const params = useParams();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-base">Bulk Operations</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Class Management */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-base">Class Management</h3>
          <div className="space-y-4">
            <Button.Primary className="w-full flex items-center justify-center gap-2">
              <HiUpload className="size-5" />
              Import Classes
            </Button.Primary>
            <Button.Light className="w-full flex items-center justify-center gap-2">
              <HiDownload className="size-5" />
              Export Classes
            </Button.Light>
            <Button.Light className="w-full flex items-center justify-center gap-2 text-error">
              <HiArchive className="size-5" />
              Bulk Archive
            </Button.Light>
          </div>
        </Card>

        {/* User Management */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-base">User Management</h3>
          <div className="space-y-4">
            <Button.Primary className="w-full flex items-center justify-center gap-2">
              <HiUpload className="size-5" />
              Import Users
            </Button.Primary>
            <Button.Light className="w-full flex items-center justify-center gap-2">
              <HiDownload className="size-5" />
              Export Users
            </Button.Light>
            <Button.Light className="w-full flex items-center justify-center gap-2 text-error">
              <HiArchive className="size-5" />
              Bulk Deactivate
            </Button.Light>
          </div>
        </Card>
      </div>
    </div>
  );
} 