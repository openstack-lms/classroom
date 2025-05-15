"use client";

import Input from "@/components/ui/Input";
import { AlertLevel } from "@/lib/alertLevel";
import { addAlert, setRefetch } from "@/store/appSlice";
import { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MdAssignment, MdPeople } from "react-icons/md";
import Empty from "@/components/ui/Empty";
import ProfilePicture from "@/components/ui/ProfilePicture";
import Button from "@/components/ui/Button";
import { trpc } from "@/utils/trpc";
import type { RouterOutput } from "@server/routers/_app";

type Assignment = RouterOutput['class']['get']['class']['assignments'][number];
type User = RouterOutput['class']['get']['class']['students'][number];

export default function EditGrades({ params }: { params: { classId: string } }) {
	const [assignments, setAssignments] = useState<(Assignment & { edited: boolean })[]>([]);
	const [students, setStudents] = useState<User[]>([]);
	const dispatch = useDispatch();
	const appState = useSelector((state: RootState) => state.app);

	const { data: classData } = trpc.class.get.useQuery({ classId: params.classId });

	useEffect(() => {
		if (classData?.class) {
			setAssignments([
				...classData.class.assignments.map((assignment: Assignment) => ({ ...assignment, edited: false }))
			]);
			setStudents([
				...classData.class.students
			]);
			dispatch(setRefetch(false));
		}
	}, [classData, dispatch]);

	const updateAssignment = trpc.assignment.update.useMutation({
		onSuccess: () => {
			dispatch(setRefetch(true));
		},
		onError: (error) => {
			dispatch(addAlert({
				level: AlertLevel.ERROR,
				remark: error.message || 'Error occurred while updating assignments'
			}));
		}
	});

	const handleValueChange = (index: number, field: string, value: any) => {
		const updatedAssignments = [...assignments];
		updatedAssignments[index] = {
			...updatedAssignments[index],
			[field]: value,
			edited: true
		};
		setAssignments(updatedAssignments);
	};

	const saveChanges = async () => {
		const editedAssignments = assignments.filter(assignment => assignment.edited);

		// Use Promise.all to handle multiple requests concurrently
		const updatePromises = editedAssignments.map(assignment => {
			return updateAssignment.mutateAsync({
				classId: params.classId,
				id: assignment.id,
				title: assignment.title,
				instructions: assignment.instructions,
				dueDate: assignment.dueDate,
				graded: assignment.graded,
				maxGrade: assignment.maxGrade || 0,
				weight: assignment.weight || 0,
				sectionId: assignment.section?.id
			});
		});

		try {
			await Promise.all(updatePromises);
		} catch (error) {
			// Error handling is done in the mutation callbacks
		}
	};

	return (
		<div className="flex flex-col space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="font-semibold text-4xl text-foreground-primary">Grades</h1>
			</div>

			{/* Assignments Section */}
			<div className="w-full border border-border dark:border-border-dark rounded-lg p-4 shadow-md bg-background overflow-x-auto">
				<div className="min-w-[70rem]">
					{assignments.length > 0 ? (
						<>
							<div className="grid grid-cols-[1fr_1fr_80px_120px_120px] gap-4 mb-3 font-medium px-4 text-foreground-secondary">
								<span>Title</span>
								<span>Due Date</span>
								<span className="text-center">Graded</span>
								<span className="text-center">Max Score</span>
								<span className="text-center">Weight</span>
							</div>
							<div className="space-y-2">
								{assignments.map((assignment, index) => (
									<div
										key={index}
										className={`
										grid grid-cols-[2fr_1fr_80px_120px_120px] gap-4 px-4 py-3 items-center rounded-md 
										${!assignment.graded ? 'text-foreground-muted' : 'hover:bg-background-muted'}`}
									>
										<span className="font-medium overflow-hidden text-ellipsis whitespace-nowrap max-w-[10rem]">{assignment.title}</span>
										<span>{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '-'}</span>
										<span className="flex justify-center">
											<input
												type="checkbox"
												checked={assignment.graded}
												className="w-4 h-4 rounded border-border focus:border-primary-500 text-primary-500 focus:ring-primary-500"
												onChange={(e) => handleValueChange(index, 'graded', e.target.checked)}
											/>
										</span>
										<span>
											{assignment.graded ? (
												<Input.Text
													type="number"
													placeholder="Max grade"
													value={assignment.maxGrade!}
													className="w-full !py-1.5 !px-3"
													onChange={(e) => handleValueChange(index, 'maxGrade', parseInt(e.target.value) || 0)}
												/>
											) : (
												<span className="text-center block">-</span>
											)}
										</span>
										<span>
											{assignment.graded ? (
												<Input.Small
													type="number"
													placeholder="Weight"
													value={assignment.weight}
													className="w-full !py-1.5 !px-3"
													onChange={(e) => handleValueChange(index, 'weight', parseInt(e.target.value) || 0)}
												/>
											) : (
												<span className="text-center block">-</span>
											)}
										</span>
									</div>
								))}
							</div>
							{assignments.some(assignment => assignment.edited) && (
								<div className="mt-6 flex justify-end">
									<Button.Primary
										onClick={saveChanges}
										disabled={updateAssignment.isPending}
									>
										{updateAssignment.isPending ? 'Saving...' : 'Save Changes'}
									</Button.Primary>
								</div>
							)}
						</>
					) : (
						<Empty
							icon={MdAssignment}
							title="No Assignments"
							description="There are no assignments in this class yet. Create assignments to start grading."
						/>
					)}
				</div>
			</div>

			{/* Students Section */}
			<div className="flex flex-col space-y-4 p-6 border border-border dark:border-border-dark rounded-lg shadow-md bg-background">
				<h2 className="text-xl font-semibold text-foreground-primary">Students</h2>

				{students.length > 0 ? (
					<div className="grid gap-4">
						{students.map((student, index) => (
							<div
								key={index}
								className="flex flex-row justify-between items-center p-3 rounded-md hover:bg-background-muted dark:hover:bg-background-subtle transition-colors"
							>
								<div className="flex flex-row items-center space-x-4">
									<ProfilePicture username={student.username} size="md" />
									<span className="font-medium text-foreground">{student.username}</span>
								</div>
								<a
									href={`/classes/${params.classId}/grades/${student.id}`}
									className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
								>
									View Grades
								</a>
							</div>
						))}
					</div>
				) : (
					<Empty
						icon={MdPeople}
						title="No Students"
						description="There are no students enrolled in this class yet. Add students to view their grades."
					/>
				)}
			</div>
		</div>
	);
}