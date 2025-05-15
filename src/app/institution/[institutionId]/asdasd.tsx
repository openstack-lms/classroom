// "use client";

// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { MdSchool, MdPeople, MdAssignment, MdClass } from "react-icons/md";
// import { trpc } from "@/utils/trpc";
// import { AlertLevel } from "@/lib/alertLevel";
// import { addAlert, setRefetch } from "@/store/appSlice";
// import { RootState } from "@/store/store";
// import Empty from "@/components/util/Empty";
// import ProfilePicture from "@/components/util/ProfilePicture";
// import Button from "@/components/util/Button";
// import type { RouterOutput } from "@server/routers/_app";

// type Class = RouterOutput['institution']['get']['classes'][number];
// type Teacher = RouterOutput['institution']['get']['teachers'][number];
// type Student = RouterOutput['institution']['get']['students'][number];

// export default function InstitutionOverview({ params }: { params: { institutionId: string } }) {
//   const [classes, setClasses] = useState<Class[]>([]);
//   const [teachers, setTeachers] = useState<Teacher[]>([]);
//   const [students, setStudents] = useState<Student[]>([]);
//   const dispatch = useDispatch();
//   const appState = useSelector((state: RootState) => state.app);

//   const { data: institutionData } = trpc.institution.get.useQuery({ institutionId: params.institutionId });

//   useEffect(() => {
//     if (institutionData) {
//       setClasses(institutionData.classes);
//       setTeachers(institutionData.teachers);
//       setStudents(institutionData.students);
//       dispatch(setRefetch(false));
//     }
//   }, [institutionData, dispatch]);

//   return (
//     <div className="flex flex-col space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="font-semibold text-4xl text-foreground-primary">Institution Overview</h1>
//       </div>

//       {/* Classes Section */}
//       <div className="w-full border border-border dark:border-border-dark rounded-lg p-4 shadow-md bg-background overflow-x-auto">
//         <div className="min-w-[70rem]">
//           {classes.length > 0 ? (
//             <>
//               <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 mb-3 font-medium px-4 text-foreground-secondary">
//                 <span>Class Name</span>
//                 <span>Subject</span>
//                 <span>Section</span>
//                 <span>Students</span>
//               </div>
//               <div className="space-y-2">
//                 {classes.map((classItem, index) => (
//                   <div
//                     key={index}
//                     className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 px-4 py-3 items-center rounded-md hover:bg-background-muted"
//                   >
//                     <span className="font-medium overflow-hidden text-ellipsis whitespace-nowrap">{classItem.name}</span>
//                     <span>{classItem.subject}</span>
//                     <span>{classItem.section}</span>
//                     <span>{classItem.students.length}</span>
//                   </div>
//                 ))}
//               </div>
//             </>
//           ) : (
//             <Empty
//               icon={MdClass}
//               title="No Classes"
//               description="There are no classes in this institution yet. Create classes to get started."
//             />
//           )}
//         </div>
//       </div>

//       {/* Teachers Section */}
//       <div className="flex flex-col space-y-4 p-6 border border-border dark:border-border-dark rounded-lg shadow-md bg-background">
//         <h2 className="text-xl font-semibold text-foreground-primary">Teachers</h2>

//         {teachers.length > 0 ? (
//           <div className="grid gap-4">
//             {teachers.map((teacher, index) => (
//               <div
//                 key={index}
//                 className="flex flex-row justify-between items-center p-3 rounded-md hover:bg-background-muted dark:hover:bg-background-subtle transition-colors"
//               >
//                 <div className="flex flex-row items-center space-x-4">
//                   <ProfilePicture username={teacher.username} size="md" />
//                   <span className="font-medium text-foreground">{teacher.username}</span>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <span className="text-foreground-secondary">
//                     {teacher.teacherIn.length} Classes
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <Empty
//             icon={MdPeople}
//             title="No Teachers"
//             description="There are no teachers in this institution yet. Add teachers to manage classes."
//           />
//         )}
//       </div>

//       {/* Students Section */}
//       <div className="flex flex-col space-y-4 p-6 border border-border dark:border-border-dark rounded-lg shadow-md bg-background">
//         <h2 className="text-xl font-semibold text-foreground-primary">Students</h2>

//         {students.length > 0 ? (
//           <div className="grid gap-4">
//             {students.map((student, index) => (
//               <div
//                 key={index}
//                 className="flex flex-row justify-between items-center p-3 rounded-md hover:bg-background-muted dark:hover:bg-background-subtle transition-colors"
//               >
//                 <div className="flex flex-row items-center space-x-4">
//                   <ProfilePicture username={student.username} size="md" />
//                   <span className="font-medium text-foreground">{student.username}</span>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <span className="text-foreground-secondary">
//                     {student.studentIn.length} Classes
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <Empty
//             icon={MdPeople}
//             title="No Students"
//             description="There are 
//             no students in this institution yet. Add students to enroll them in classes."
//           />
//         )}
//       </div>
//     </div>
//   );
// } 