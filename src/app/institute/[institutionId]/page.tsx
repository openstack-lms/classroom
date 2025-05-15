"use client";

import { useParams } from "next/navigation";
import Card from "@/components/ui/Card";
import { HiAcademicCap, HiUserGroup, HiBookOpen, HiChartBar, HiCalendar, HiOfficeBuilding } from "react-icons/hi";
import { trpc } from "@/utils/trpc";
import { useEffect, useState } from "react";
import Empty from "@/components/ui/Empty";
import ProfilePicture from "@/components/ui/ProfilePicture";
import Button from "@/components/ui/Button";
import { MdAssignment, MdPeople, MdSchool, MdAdd, MdRefresh, MdBook, MdClass, MdBusiness, MdMenuBook, MdTrendingUp } from "react-icons/md";
import type { RouterOutputs } from "@server/routers/_app";
import { useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useDispatch, useSelector } from "react-redux";
import { openModal } from "@/store/appSlice";
import type { ModalType } from '@/store/appSlice';
import CreateDepartment from "@/components/institute/forms/CreateDepartment";
import CreateCourse from "@/components/institute/forms/CreateCourse";
import AddStudent from "@/components/institute/forms/AddStudent";
import AddTeacher from "@/components/institute/forms/AddTeacher";
import AddClass from "@/components/institute/forms/AddClass";
import BulkAdd from "@/components/institute/forms/BulkAdd";
import { RootState } from "@/store/store";

type Institution = NonNullable<RouterOutputs['institution']['get']>;
type Department = RouterOutputs['department']['list'][number];
type Course = RouterOutputs['course']['list'][number];
type Class = NonNullable<Institution['classes'][number]>;

type DashboardStats = RouterOutputs['institution']['getDashboardStats'];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface DepartmentData {
  name: string;
  value: number;
}

interface EnrollmentData {
  createdAt: string;
  _count: number;
}

interface Activity {
  type: 'create' | 'update' | 'delete';
  description: string;
  createdAt: string;
}

export default function InstitutionDashboard({ params }: { params: { institutionId: string } }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: stats, isLoading } = trpc.institution.getDashboardStats.useQuery({
    institutionId: params.institutionId,
  });

  const appState = useSelector((state: RootState) => state.app);

  console.log(appState);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  // Process enrollment trends data
  const enrollmentData = stats?.enrollmentTrends.students.map((student: EnrollmentData, index: number) => ({
    name: new Date(student.createdAt).toLocaleString('default', { month: 'short' }),
    students: student._count,
    teachers: stats.enrollmentTrends.teachers[index]?._count || 0,
  })) || [];

  const departmentData: DepartmentData[] = stats?.departmentDistribution || [];

  const statCards = [
    {
      title: 'Total Students',
      value: stats?.stats.totalStudents || 0,
      icon: MdPeople,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Teachers',
      value: stats?.stats.totalTeachers || 0,
      icon: MdPeople,
      color: 'bg-green-500',
    },
    {
      title: 'Total Classes',
      value: stats?.stats.totalClasses || 0,
      icon: MdClass,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Departments',
      value: stats?.stats.totalDepartments || 0,
      icon: MdBusiness,
      color: 'bg-yellow-500',
    },
    {
      title: 'Total Courses',
      value: stats?.stats.totalCourses || 0,
      icon: MdMenuBook,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Institute Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color} text-white mr-4`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                <p className="text-2xl font-semibold">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Enrollment Trends</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="students" stroke="#8884d8" name="Students" />
                <Line type="monotone" dataKey="teachers" stroke="#82ca9d" name="Teachers" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">Department Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }: { name: string; percent: number }) => 
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">Course Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {stats?.recentActivity?.map((activity: Activity, index: number) => (
              <div key={index} className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${activity.type === 'create' ? 'bg-green-100' : 'bg-blue-100'}`}>
                  <MdTrendingUp className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button.Primary
          onClick={() => dispatch(openModal({ body: <CreateDepartment />, header: 'Add Department' }))}
        >
          <MdAdd className="h-6 w-6 text-blue-500" />
          <span className="mt-2 block text-sm font-medium">Add Department</span>
        </Button.Primary>
        <Button.Primary
          onClick={() => dispatch(openModal({ body: <CreateCourse />, header: 'Add Course' }))}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <span className="mt-2 block text-sm font-medium">Add Course</span>
        </Button.Primary>
        <Button.Primary
          onClick={() => dispatch(openModal({ body: <AddTeacher />, header: 'Add Teacher' }))}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <span className="mt-2 block text-sm font-medium">Add Teacher</span>
        </Button.Primary>
        <Button.Primary
          onClick={() => dispatch(openModal({ body: <AddStudent />, header: 'Add Student' }))}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <span className="mt-2 block text-sm font-medium">Add Student</span>
        </Button.Primary>
      </div>
    </div>
  );
} 