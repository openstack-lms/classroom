"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/utils/trpc";
import Card from "@/components/ui/Card";
import { HiOfficeBuilding, HiUserGroup, HiBookOpen, HiCalendar } from "react-icons/hi";
import Button from "@/components/ui/Button";
import Empty from "@/components/ui/Empty";
import ProfilePicture from "@/components/ui/ProfilePicture";
import type { RouterOutputs } from "@server/routers/_app";

type Department = NonNullable<RouterOutputs['department']['list'][number]>;
type Course = RouterOutputs['course']['list'][number];
type Teacher = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  classes?: { id: string }[];
};

export default function DepartmentPage() {
  const params = useParams();
  const institutionId = params.institutionId as string;
  const departmentId = params.departmentId as string;

  const { data: departments } = trpc.department.list.useQuery({ institutionId });
  const { data: courses } = trpc.course.list.useQuery({ institutionId, departmentId });
  
  const department = departments?.find((d: Department) => d.id === departmentId);

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

  return (
    <div className="p-6 space-y-6">
      {/* Department Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{department.name}</h1>
          <p className="text-muted">{department.description}</p>
        </div>
        <Button.Primary href={`/institute/${institutionId}/departments/${departmentId}/edit`}>
          Edit Department
        </Button.Primary>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <HiUserGroup className="size-8 text-primary-500" />
            <div>
              <h3 className="text-sm font-medium text-muted">Total Teachers</h3>
              <p className="text-2xl font-bold text-base">{department.teachers.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <HiBookOpen className="size-8 text-primary-500" />
            <div>
              <h3 className="text-sm font-medium text-muted">Total Courses</h3>
              <p className="text-2xl font-bold text-base">{courses?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <HiCalendar className="size-8 text-primary-500" />
            <div>
              <h3 className="text-sm font-medium text-muted">Active Classes</h3>
              <p className="text-2xl font-bold text-base">
                {department.teachers.reduce((acc: number, teacher: Teacher) => acc + (teacher.classes?.length || 0), 0)}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <HiOfficeBuilding className="size-8 text-primary-500" />
            <div>
              <h3 className="text-sm font-medium text-muted">Department Head</h3>
              <p className="text-2xl font-bold text-base">
                {department.head ? `${department.head.firstName} ${department.head.lastName}` : 'Not Assigned'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Teachers Section */}
      <div className="border border-border rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Department Teachers</h2>
          <Button.Primary href={`/institute/${institutionId}/departments/${departmentId}/teachers/add`}>
            Add Teacher
          </Button.Primary>
        </div>
        {department.teachers.length > 0 ? (
          <div className="space-y-4">
            {department.teachers.map((teacher: Teacher) => (
              <div key={teacher.id} className="flex items-center justify-between p-4 rounded-md hover:bg-background-muted">
                <div className="flex items-center space-x-4">
                  <ProfilePicture username={teacher.username} size="md" />
                  <div>
                    <p className="font-medium">{teacher.firstName} {teacher.lastName}</p>
                    <p className="text-sm text-muted">{teacher.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted">{teacher.classes?.length || 0} Classes</span>
                  <Button.Light href={`/institute/${institutionId}/teachers/${teacher.id}`}>
                    View Profile
                  </Button.Light>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            icon={HiUserGroup}
            title="No Teachers"
            description="Add teachers to this department."
          />
        )}
      </div>

      {/* Courses Section */}
      <div className="border border-border rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Department Courses</h2>
          <Button.Primary href={`/institute/${institutionId}/courses/new?departmentId=${departmentId}`}>
            Add Course
          </Button.Primary>
        </div>
        {courses && courses.length > 0 ? (
          <div className="space-y-4">
            {courses.map((course: Course) => (
              <div key={course.id} className="flex items-center justify-between p-4 rounded-md hover:bg-background-muted">
                <div className="flex items-center space-x-4">
                  <HiBookOpen className="size-5 text-primary-500" />
                  <div>
                    <p className="font-medium">{course.name}</p>
                    <p className="text-sm text-muted">{course.code} - {course.credits} Credits</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted">{course.prerequisites?.length || 0} Prerequisites</span>
                  <Button.Light href={`/institute/${institutionId}/courses/${course.id}`}>
                    View Details
                  </Button.Light>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            icon={HiBookOpen}
            title="No Courses"
            description="Add courses to this department."
          />
        )}
      </div>
    </div>
  );
} 