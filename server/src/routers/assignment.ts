import { z } from "zod";
import { createTRPCRouter, protectedProcedure, protectedClassMemberProcedure, protectedTeacherProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { prisma } from "@lib/prisma";
import { uploadFiles, type UploadedFile } from "@lib/fileUpload";
import { deleteFile } from "@lib/googleCloudStorage";

const fileSchema = z.object({
  name: z.string(),
  type: z.string(),
  size: z.number(),
  data: z.string(), // base64 encoded file data
});

const createAssignmentSchema = z.object({
  classId: z.string(),
  title: z.string(),
  instructions: z.string(),
  dueDate: z.string(),
  files: z.array(fileSchema).optional(),
  maxGrade: z.number().optional(),
  graded: z.boolean().optional(),
  weight: z.number().optional(),
  sectionId: z.string().optional(),
  type: z.enum(['HOMEWORK', 'QUIZ', 'TEST', 'PROJECT', 'ESSAY', 'DISCUSSION', 'PRESENTATION', 'LAB', 'OTHER']).optional(),
  rubric: z.object({
    criteria: z.array(z.object({
      name: z.string(),
      description: z.string(),
      maxPoints: z.number()
    }))
  }).optional()
});

const updateAssignmentSchema = z.object({
  classId: z.string(),
  id: z.string(),
  title: z.string().optional(),
  instructions: z.string().optional(),
  dueDate: z.string().optional(),
  files: z.array(fileSchema).optional(),
  maxGrade: z.number().optional(),
  graded: z.boolean().optional(),
  weight: z.number().optional(),
  sectionId: z.string().optional(),
  type: z.enum(['HOMEWORK', 'QUIZ', 'TEST', 'PROJECT', 'ESSAY', 'DISCUSSION', 'PRESENTATION', 'LAB', 'OTHER']).optional(),
  rubric: z.object({
    criteria: z.array(z.object({
      name: z.string(),
      description: z.string(),
      maxPoints: z.number()
    }))
  }).optional()
});

const deleteAssignmentSchema = z.object({
  id: z.string(),
  classId: z.string(),
});

const getAssignmentSchema = z.object({
  id: z.string(),
  classId: z.string(),
});

const submissionSchema = z.object({
  assignmentId: z.string(),
  classId: z.string(),
  submissionId: z.string(),
  submit: z.boolean().optional(),
  newAttachments: z.array(fileSchema).optional(),
  removedAttachments: z.array(z.string()).optional(),
});

const updateSubmissionSchema = z.object({
  assignmentId: z.string(),
  classId: z.string(),
  submissionId: z.string(),
  return: z.boolean().optional(),
  gradeReceived: z.number().nullable().optional(),
  newAttachments: z.array(fileSchema).optional(),
  removedAttachments: z.array(z.string()).optional(),
});

export const assignmentRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createAssignmentSchema)
    .mutation(async ({ ctx, input }) => {
      const { classId, title, instructions, dueDate, files, maxGrade, graded, weight, sectionId } = input;

      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be authenticated",
        });
      }

      // Get all students in the class
      const classData = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          students: {
            select: { id: true }
          }
        }
      });

      if (!classData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Class not found",
        });
      }

      // Create assignment with submissions for all students
      const assignment = await prisma.assignment.create({
        data: {
          title,
          instructions,
          dueDate: new Date(dueDate),
          maxGrade,
          graded,
          weight,
          class: {
            connect: { id: classId }
          },
          ...(sectionId && {
            section: {
              connect: { id: sectionId }
            }
          }),
          submissions: {
            create: classData.students.map((student) => ({
              student: {
                connect: { id: student.id }
              }
            }))
          },
          teacher: {
            connect: { id: ctx.user.id }
          }
        },
        include: {
          submissions: {
            include: {
              student: {
                select: {
                  id: true,
                  username: true
                }
              }
            }
          },
          attachments: true,
          section: true,
          teacher: true,
          class: true
        }
      });

      // Upload files if provided
      let uploadedFiles: UploadedFile[] = [];
      if (files && files.length > 0) {
        // Store files in a class and assignment specific directory
        uploadedFiles = await uploadFiles(files, ctx.user.id, `class/${classId}/assignment/${assignment.id}`);
      }

      // Update assignment with new file attachments
      if (uploadedFiles.length > 0) {
        await prisma.assignment.update({
          where: { id: assignment.id },
          data: {
            attachments: {
              create: uploadedFiles.map(file => ({
                name: file.name,
                type: file.type,
                size: file.size,
                path: file.path,
                ...(file.thumbnailId && {
                  thumbnail: {
                    connect: { id: file.thumbnailId }
                  }
                })
              }))
            }
          }
        });
      }

      return assignment;
    }),

  update: protectedProcedure
    .input(updateAssignmentSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, title, instructions, dueDate, files, maxGrade, graded, weight, sectionId } = input;

      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be authenticated",
        });
      }

      // Get the assignment with current attachments
      const assignment = await prisma.assignment.findFirst({
        where: {
          id,
          teacherId: ctx.user.id,
        },
        include: {
          attachments: {
            include: {
              thumbnail: true
            }
          },
          class: true,
        },
      });

      if (!assignment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Assignment not found",
        });
      }

      // Upload new files if provided
      let uploadedFiles: UploadedFile[] = [];
      if (files && files.length > 0) {
        // Store files in a class and assignment specific directory
        uploadedFiles = await uploadFiles(files, ctx.user.id, `class/${assignment.classId}/assignment/${id}`);
      }

      // Update assignment
      const updatedAssignment = await prisma.assignment.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(instructions && { instructions }),
          ...(dueDate && { dueDate: new Date(dueDate) }),
          ...(maxGrade && { maxGrade }),
          ...(graded !== undefined && { graded }),
          ...(weight && { weight }),
          ...(sectionId && {
            section: {
              connect: { id: sectionId }
            }
          }),
          ...(uploadedFiles.length > 0 && {
            attachments: {
              create: uploadedFiles.map(file => ({
                name: file.name,
                type: file.type,
                size: file.size,
                path: file.path,
                ...(file.thumbnailId && {
                  thumbnail: {
                    connect: { id: file.thumbnailId }
                  }
                })
              }))
            }
          }),
        },
        include: {
          submissions: {
            include: {
              student: {
                select: {
                  id: true,
                  username: true
                }
              }
            }
          },
          attachments: {
            include: {
              thumbnail: true
            }
          },
          section: true,
          teacher: true,
          class: true
        }
      });

      return updatedAssignment;
    }),

  delete: protectedProcedure
    .input(deleteAssignmentSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, classId } = input;

      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be authenticated",
        });
      }

      // Get the assignment with all related files
      const assignment = await prisma.assignment.findFirst({
        where: {
          id,
          teacherId: ctx.user.id,
        },
        include: {
          attachments: {
            include: {
              thumbnail: true
            }
          },
          submissions: {
            include: {
              attachments: {
                include: {
                  thumbnail: true
                }
              },
              annotations: {
                include: {
                  thumbnail: true
                }
              }
            }
          }
        }
      });

      if (!assignment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Assignment not found",
        });
      }

      // Delete all files from storage
      const filesToDelete = [
        ...assignment.attachments,
        ...assignment.submissions.flatMap(sub => [...sub.attachments, ...sub.annotations])
      ];

      // Delete files from storage
      await Promise.all(filesToDelete.map(async (file) => {
        try {
          // Delete the main file
          await deleteFile(file.path);
          
          // Delete thumbnail if it exists
          if (file.thumbnail) {
            await deleteFile(file.thumbnail.path);
          }
        } catch (error) {
          console.warn(`Failed to delete file ${file.path}:`, error);
        }
      }));

      // Delete the assignment (this will cascade delete all related records)
      await prisma.assignment.delete({
        where: { id },
      });

      return { deletedAssignment: {
        id,
      } };
    }),

  get: protectedProcedure
    .input(getAssignmentSchema)
    .query(async ({ ctx, input }) => {
      const { id, classId } = input;

      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be authenticated",
        });
      }

      const assignment = await prisma.assignment.findFirst({
        where: {
          id,
          classId,
        },
        include: {
          submissions: {
            include: {
              student: {
                select: {
                  id: true,
                  username: true
                }
              }
            }
          },
          attachments: {
            include: {
              thumbnail: true
            }
          },
          section: true,
          teacher: true,
          class: true
        }
      });

      if (!assignment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Assignment not found",
        });
      }

      return assignment;
    }),

  getSubmission: protectedClassMemberProcedure
    .input(z.object({
      assignmentId: z.string(),
      classId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be authenticated",
        });
      }

      const { assignmentId } = input;

      const submission = await prisma.submission.findFirst({
        where: {
          assignmentId,
          studentId: ctx.user.id,
        },
        include: {
          attachments: true,
          student: {
            select: {
              id: true,
              username: true,
            },
          },
          assignment: {
            include: {
              class: true,
            },
          },
          annotations: true,
        },
      });

      if (!submission) {
        // Create a new submission if it doesn't exist
        return await prisma.submission.create({
          data: {
            assignment: {
              connect: { id: assignmentId },
            },
            student: {
              connect: { id: ctx.user.id },
            },
          },
          include: {
            attachments: true,
            annotations: true,
            student: {
              select: {
                id: true,
                username: true,
              },
            },
            assignment: {
              include: {
                class: true,
              },
            },
          },
        });
      }

      return submission;
    }),

  getSubmissionById: protectedTeacherProcedure
    .input(z.object({
      submissionId: z.string(),
      classId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be authenticated",
        });
      }

      const { submissionId, classId } = input;

      const submission = await prisma.submission.findFirst({
        where: {
          id: submissionId,
          assignment: {
            classId,
            class: {
              teachers: {
                some: {
                  id: ctx.user.id
                }
              }
            }
          },
        },
        include: {
          attachments: true,
          annotations: true,
          student: {
            select: {
              id: true,
              username: true,
            },
          },
          assignment: {
            include: {
              class: true,
            },
          },
        },
      });

      if (!submission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Submission not found",
        });
      }

      return submission;
    }),

  updateSubmission: protectedClassMemberProcedure
    .input(submissionSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be authenticated",
        });
      }

      const { submissionId, submit, newAttachments, removedAttachments } = input;

      const submission = await prisma.submission.findFirst({
        where: {
          id: submissionId,
          OR: [
            {
              student: {
                id: ctx.user.id,
              },
            },
            {
              assignment: {
                class: {
                  teachers: {
                    some: {
                      id: ctx.user.id,
                    },
                  },
                },
              },
            },
          ],
        },
        include: {
          attachments: {
            include: {
              thumbnail: true
            }
          },
          assignment: {
            include: {
              class: true,
            },
          },
        },
      });

      if (!submission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Submission not found",
        });
      }

      if (submit !== undefined) {
        // Toggle submission status
        return await prisma.submission.update({
          where: { id: submission.id },
          data: {
            submitted: !submission.submitted,
            submittedAt: new Date(),
          },
          include: {
            attachments: true,
            student: {
              select: {
                id: true,
                username: true,
              },
            },
            assignment: {
              include: {
                class: true,
              },
            },
          },
        });
      }

      let uploadedFiles: UploadedFile[] = [];
      if (newAttachments && newAttachments.length > 0) {
        // Store files in a class and assignment specific directory
        uploadedFiles = await uploadFiles(newAttachments, ctx.user.id, `class/${submission.assignment.classId}/assignment/${submission.assignmentId}/submission/${submission.id}`);
      }

      // Update submission with new file attachments
      if (uploadedFiles.length > 0) {
        await prisma.submission.update({
          where: { id: submission.id },
          data: {
            attachments: {
              create: uploadedFiles.map(file => ({
                name: file.name,
                type: file.type,
                size: file.size,
                path: file.path,
                ...(file.thumbnailId && {
                  thumbnail: {
                    connect: { id: file.thumbnailId }
                  }
                })
              }))
            }
          }
        });
      }

      // Delete removed attachments if any
      if (removedAttachments && removedAttachments.length > 0) {
        const filesToDelete = submission.attachments.filter((file) => 
          removedAttachments.includes(file.id)
        );

        // Delete files from storage
        await Promise.all(filesToDelete.map(async (file) => {
          try {
            // Delete the main file
            await deleteFile(file.path);
            
            // Delete thumbnail if it exists
            if (file.thumbnail?.path) {
              await deleteFile(file.thumbnail.path);
            }
          } catch (error) {
            console.warn(`Failed to delete file ${file.path}:`, error);
          }
        }));
      }

      // Update submission with attachments
      return await prisma.submission.update({
        where: { id: submission.id },
        data: {
          ...(removedAttachments && removedAttachments.length > 0 && {
            attachments: {
              deleteMany: {
                id: { in: removedAttachments },
              },
            },
          }),
        },
        include: {
          attachments: {
            include: {
              thumbnail: true
            }
          },
          student: {
            select: {
              id: true,
              username: true,
            },
          },
          assignment: {
            include: {
              class: true,
            },
          },
        },
      });
    }),

  getSubmissions: protectedTeacherProcedure
    .input(z.object({
      assignmentId: z.string(),
      classId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be authenticated",
        });
      }

      const { assignmentId } = input;

      const submissions = await prisma.submission.findMany({
        where: {
          assignment: {
            id: assignmentId,
            class: {
              teachers: {
                some: { id: ctx.user.id },
              },
            },
          },
        },
        include: {
          attachments: {
            include: {
              thumbnail: true
            }
          },
          student: {
            select: {
              id: true,
              username: true,
            },
          },
          assignment: {
            include: {
              class: true,
            },
          },
        },
      });

      return submissions;
    }),

  updateSubmissionAsTeacher: protectedTeacherProcedure
    .input(updateSubmissionSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be authenticated",
        });
      }

      const { submissionId, return: returnSubmission, gradeReceived, newAttachments, removedAttachments } = input;

      const submission = await prisma.submission.findFirst({
        where: {
          id: submissionId,
          assignment: {
            class: {
              teachers: {
                some: { id: ctx.user.id },
              },
            },
          },
        },
        include: {
          attachments: {
            include: {
              thumbnail: true
            }
          },
          annotations: {
            include: {
              thumbnail: true
            }
          },
          assignment: {
            include: {
              class: true,
            },
          },
        },
      });

      if (!submission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Submission not found",
        });
      }

      if (returnSubmission !== undefined) {
        // Toggle return status
        return await prisma.submission.update({
          where: { id: submissionId },
          data: {
            returned: !submission.returned,
          },
          include: {
            attachments: true,
            student: {
              select: {
                id: true,
                username: true,
              },
            },
            assignment: {
              include: {
                class: true,
              },
            },
          },
        });
      }

      let uploadedFiles: UploadedFile[] = [];
      if (newAttachments && newAttachments.length > 0) {
        // Store files in a class and assignment specific directory
        uploadedFiles = await uploadFiles(newAttachments, ctx.user.id, `class/${submission.assignment.classId}/assignment/${submission.assignmentId}/submission/${submission.id}/annotations`);
      }

      // Update submission with new file attachments
      if (uploadedFiles.length > 0) {
        await prisma.submission.update({
          where: { id: submission.id },
          data: {
            annotations: {
              create: uploadedFiles.map(file => ({
                name: file.name,
                type: file.type,
                size: file.size,
                path: file.path,
                ...(file.thumbnailId && {
                  thumbnail: {
                    connect: { id: file.thumbnailId }
                  }
                })
              }))
            }
          }
        });
      }

      // Delete removed attachments if any
      if (removedAttachments && removedAttachments.length > 0) {
        const filesToDelete = submission.annotations.filter((file) => 
          removedAttachments.includes(file.id)
        );

        // Delete files from storage
        await Promise.all(filesToDelete.map(async (file) => {
          try {
            // Delete the main file
            await deleteFile(file.path);
            
            // Delete thumbnail if it exists
            if (file.thumbnail?.path) {
              await deleteFile(file.thumbnail.path);
            }
          } catch (error) {
            console.warn(`Failed to delete file ${file.path}:`, error);
          }
        }));
      }

      // Update submission with grade and attachments
      return await prisma.submission.update({
        where: { id: submissionId },
        data: {
          ...(gradeReceived !== undefined && { gradeReceived }),
          ...(removedAttachments && removedAttachments.length > 0 && {
            annotations: {
              deleteMany: {
                id: { in: removedAttachments },
              },
            },
          }),
        },
        include: {
          attachments: {
            include: {
              thumbnail: true
            }
          },
          annotations: {
            include: {
              thumbnail: true
            }
          },
          student: {
            select: {
              id: true,
              username: true,
            },
          },
          assignment: {
            include: {
              class: true,
            },
          },
        },
      });
    }),
});

