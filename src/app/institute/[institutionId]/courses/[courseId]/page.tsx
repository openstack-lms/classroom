"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/utils/trpc";
import Card from "@/components/ui/Card";
import { HiBookOpen, HiUserGroup, HiCalendar, HiAcademicCap } from "react-icons/hi";
import Button from "@/components/ui/Button";
import Empty from "@/components/ui/Empty";
import ProfilePicture from "@/components/ui/ProfilePicture";
import type { RouterOutputs } from "@server/routers/_app";

type Course = NonNullable<RouterOutputs['course']['list'][number]>;
type Class = {
  id: string;
  name: string;
  section: string;
  subject: string;
  teachers?: { id: string }[];
  students?: { id: string }[];
};

export default function CoursePage() {
  const params = useParams();
  const institutionId = params.institutionId as string;
  const courseId = params.courseId as string;

  const { data: courses } = trpc.course.list.useQuery({ institutionId });
  const { data: classData } = trpc.class.getAll.useQuery();
  
  const course = courses?.find((c: Course) => c.id === courseId);
  const classes = classData?.teacherInClass.filter((c: { id: string }) => c.id === courseId) || [];

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

  return (
    <div className="p-6 space-y-6">
      {/* Course Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{course.name}</h1>
          <p className="text-muted">{course.code} - {course.credits} Credits</p>
        </div>
        <Button.Primary href={`/institute/${institutionId}/courses/${courseId}/edit`}>
          Edit Course
        </Button.Primary>
      </div>

      {/* Course Description */}
      <Card>
        <h2 className="text-lg font-semibold mb-2">Course Description</h2>
        <p className="text-muted">{course.description}</p>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <HiUserGroup className="size-8 text-primary-500" />
            <div>
              <h3 className="text-sm font-medium text-muted">Total Students</h3>
              <p className="text-2xl font-bold text-base">
                {classes.reduce((acc: number, classItem: Class) => acc + (classItem.students?.length || 0), 0)}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <HiAcademicCap className="size-8 text-primary-500" />
            <div>
              <h3 className="text-sm font-medium text-muted">Total Teachers</h3>
              <p className="text-2xl font-bold text-base">
                {classes.reduce((acc: number, classItem: Class) => acc + (classItem.teachers?.length || 0), 0)}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <HiCalendar className="size-8 text-primary-500" />
            <div>
              <h3 className="text-sm font-medium text-muted">Active Classes</h3>
              <p className="text-2xl font-bold text-base">{classes.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <HiBookOpen className="size-8 text-primary-500" />
            <div>
              <h3 className="text-sm font-medium text-muted">Department</h3>
              <p className="text-2xl font-bold text-base">{course.department.name}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Prerequisites Section */}
      {course.prerequisites && course.prerequisites.length > 0 && (
        <div className="border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Prerequisites</h2>
          <div className="space-y-4">
            {course.prerequisites.map((prerequisite: Course) => (
              <div key={prerequisite.id} className="flex items-center justify-between p-4 rounded-md hover:bg-background-muted">
                <div className="flex items-center space-x-4">
                  <HiBookOpen className="size-5 text-primary-500" />
                  <div>
                    <p className="font-medium">{prerequisite.name}</p>
                    <p className="text-sm text-muted">{prerequisite.code} - {prerequisite.credits} Credits</p>
                  </div>
                </div>
                <Button.Light href={`/institute/${institutionId}/courses/${prerequisite.id}`}>
                  View Course
                </Button.Light>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Classes Section */}
      <div className="border border-border rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Active Classes</h2>
          <Button.Primary href={`/institute/${institutionId}/classes/new?courseId=${courseId}`}>
            Create Class
          </Button.Primary>
        </div>
        {classes.length > 0 ? (
          <div className="space-y-4">
            {classes.map((classItem: Class) => (
              <div key={classItem.id} className="flex items-center justify-between p-4 rounded-md hover:bg-background-muted">
                <div className="flex items-center space-x-4">
                  <HiCalendar className="size-5 text-primary-500" />
                  <div>
                    <p className="font-medium">{classItem.name}</p>
                    <p className="text-sm text-muted">
                      {classItem.teachers?.length || 0} Teachers • {classItem.students?.length || 0} Students
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted">{classItem.section}</span>
                  <Button.Light href={`/classes/${classItem.id}`}>
                    View Class
                  </Button.Light>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            icon={HiCalendar}
            title="No Active Classes"
            description="Create a new class for this course."
          />
        )}
      </div>

      {/* Syllabus Section */}
      {course.syllabus && (
        <div className="border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Course Syllabus</h2>
          <div className="prose dark:prose-invert max-w-none">
            {course.syllabus}
          </div>
        </div>
      )}
    </div>
  );
} 