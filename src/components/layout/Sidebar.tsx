import React from 'react';
import { MdDashboard, MdClass, MdBusiness, MdMenuBook, MdPeople, MdPerson, MdSettings } from 'react-icons/md';
import { useParams } from 'next/navigation';

const Sidebar: React.FC = () => {
  const params = useParams();
  const institutionId = params.institutionId as string;

  const navigation = [
    { 
      name: 'Dashboard', 
      href: `/institute/${institutionId}`, 
      icon: MdDashboard 
    },
    { 
      name: 'Classes', 
      href: `/institute/${institutionId}/classes`, 
      icon: MdClass 
    },
    {
      name: 'Departments',
      href: `/institute/${institutionId}/departments`,
      icon: MdBusiness,
      children: [
        { 
          name: 'All Departments', 
          href: `/institute/${institutionId}/departments` 
        },
        { 
          name: 'Add Department', 
          href: `/institute/${institutionId}/departments/create` 
        },
      ],
    },
    {
      name: 'Courses',
      href: `/institute/${institutionId}/courses`,
      icon: MdMenuBook,
      children: [
        { 
          name: 'All Courses', 
          href: `/institute/${institutionId}/courses` 
        },
        { 
          name: 'Add Course', 
          href: `/institute/${institutionId}/courses/create` 
        },
      ],
    },
    { 
      name: 'Students', 
      href: `/institute/${institutionId}/students`, 
      icon: MdPeople 
    },
    { 
      name: 'Teachers', 
      href: `/institute/${institutionId}/teachers`, 
      icon: MdPerson 
    },
    { 
      name: 'Settings', 
      href: `/institute/${institutionId}/settings`, 
      icon: MdSettings 
    },
  ];

  return (
    <div className="w-64 bg-white p-6 space-y-6">
      <nav className="space-y-2">
        {navigation.map((item) => (
          <div key={item.name}>
            <a
              href={item.href}
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span>{item.name}</span>
            </a>
            {item.children && (
              <div className="ml-8 mt-2 space-y-1">
                {item.children.map((child) => (
                  <a
                    key={child.name}
                    href={child.href}
                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    {child.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar; 