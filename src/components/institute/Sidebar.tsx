import { useParams } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import { 
  HiHome,
  HiAcademicCap,
  HiOfficeBuilding,
  HiBookOpen,
  HiUserGroup,
  HiUser,
  HiCog
} from 'react-icons/hi';

const SchoolSidebar: React.FC = () => {
  const params = useParams();
  const institutionId = params.institutionId as string;

  const navigation = [
    { 
      label: 'Dashboard', 
      href: `/institute/${institutionId}`, 
      icon: <HiHome className="size-5" /> 
    },
    { 
      label: 'Classes', 
      href: `/institute/${institutionId}/classes`, 
      icon: <HiAcademicCap className="size-5" /> 
    },
    {
      label: 'Departments',
      href: `/institute/${institutionId}/departments`,
      icon: <HiOfficeBuilding className="size-5" />,
    },
    {
      label: 'Courses',
      href: `/institute/${institutionId}/courses`,
      icon: <HiBookOpen className="size-5" />,
    },
    { 
      label: 'Students', 
      href: `/institute/${institutionId}/students`, 
      icon: <HiUserGroup className="size-5" /> 
    },
    { 
      label: 'Teachers', 
      href: `/institute/${institutionId}/teachers`, 
      icon: <HiUser className="size-5" /> 
    },
    { 
      label: 'Settings', 
      href: `/institute/${institutionId}/settings`, 
      icon: <HiCog className="size-5" /> 
    },
  ];

  return (
    <Sidebar 
      title="School"
      navigationItems={navigation}
    />
  );
};

export default SchoolSidebar; 