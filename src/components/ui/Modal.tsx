import { useSelector, useDispatch } from 'react-redux';
import { closeModal } from '@/store/appSlice';
import { MdClose } from 'react-icons/md';
import AddStudent from '@/components/institute/forms/AddStudent';
import AddTeacher from '@/components/institute/forms/AddTeacher';
import AddClass from '@/components/institute/forms/AddClass';
import CreateDepartment from '@/components/institute/forms/CreateDepartment';
import CreateCourse from '@/components/institute/forms/CreateCourse';
import BulkAdd from '@/components/institute/forms/BulkAdd';
import type { ModalType } from '@/store/appSlice';

const ModalContent = ({ type }: { type: ModalType }) => {
  switch (type) {
    case 'add-student':
      return <AddStudent />;
    case 'add-teacher':
      return <AddTeacher />;
    case 'add-class':
      return <AddClass />;
    case 'add-department':
      return <CreateDepartment />;
    case 'add-course':
      return <CreateCourse />;
    case 'bulk-add':
      return <BulkAdd />;
    default:
      return null;
  }
};

export default function Modal() {
  const dispatch = useDispatch();
  const { type, header } = useSelector((state: any) => state.app.modal);

  if (!type) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">{header}</h2>
          <button
            onClick={() => dispatch(closeModal())}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <MdClose className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4">
          <ModalContent type={type} />
        </div>
      </div>
    </div>
  );
} 