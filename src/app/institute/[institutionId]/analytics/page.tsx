"use client";

import { trpc } from '@/utils/trpc';
import Card from '@/components/ui/Card';
import { MdPeople, MdClass, MdBusiness, MdMenuBook, MdTrendingUp } from 'react-icons/md';
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface DepartmentData {
  name: string;
  value: number;
}

interface Activity {
  type: 'create' | 'update' | 'delete';
  description: string;
  createdAt: string;
}

export default function AnalyticsPage({ params }: { params: { institutionId: string } }) {
  const { data: stats, isLoading } = trpc.institution.getDashboardStats.useQuery({
    institutionId: params.institutionId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  const enrollmentData = [
    { name: 'Jan', students: 120, teachers: 15 },
    { name: 'Feb', students: 150, teachers: 18 },
    { name: 'Mar', students: 180, teachers: 20 },
    { name: 'Apr', students: 200, teachers: 22 },
    { name: 'May', students: 220, teachers: 25 },
    { name: 'Jun', students: 250, teachers: 28 },
  ];

  const departmentData: DepartmentData[] = [
    { name: 'Computer Science', value: 35 },
    { name: 'Mathematics', value: 25 },
    { name: 'Physics', value: 20 },
    { name: 'Chemistry', value: 15 },
    { name: 'Biology', value: 5 },
  ];

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
      <h1 className="text-2xl font-bold mb-8">Analytics Dashboard</h1>

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
            {stats?.recentActivity.map((activity: Activity, index: number) => (
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
    </div>
  );
} 