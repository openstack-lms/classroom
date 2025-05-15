import { z } from "zod";
import { createTRPCRouter, protectedProcedure, protectedTeacherProcedure, protectedClassMemberProcedure } from "../trpc";
import { prisma } from "@lib/prisma";
import { TRPCError } from "@trpc/server";
import { generateInviteCode } from "@/utils/generateInviteCode";

export const classRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const [teacherClasses, studentClasses] = await Promise.all([
        prisma.class.findMany({
          where: {
              teachers: {
                some: {
                  id: ctx.user?.id,
              },
            },
          },
          include: {
            assignments: {
              where: {
                dueDate: {
                  equals: new Date(new Date().setHours(0, 0, 0, 0)),
                },
              },
              select: {
                id: true,
                title: true,
              },
            },
          },
        }),
        prisma.class.findMany({
          where: {
            students: {
              some: {
                id: ctx.user?.id,
              },
            },
          },
          include: {
            assignments: {
              where: {
                dueDate: {
                  equals: new Date(new Date().setHours(0, 0, 0, 0)),
                },
              },
              select: {
                id: true,
                title: true,
              },
            },
          },
        }),
      ]);

      return {
        teacherInClass: teacherClasses.map(cls => ({
          id: cls.id,
          name: cls.name,
          section: cls.section,
          subject: cls.subject,
          dueToday: cls.assignments,
        })),
        studentInClass: studentClasses.map(cls => ({
          id: cls.id,
          name: cls.name,
          section: cls.section,
          subject: cls.subject,
          dueToday: cls.assignments,
        })),
      };
    }),
  get: protectedProcedure
    .input(z.object({
      classId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { classId } = input;

      const classData = await prisma.class.findUnique({
        where: {
          id: classId,
        },
        include: {
          teachers: {
            select: {
              id: true,
              username: true,
            },
          },
          students: {
            select: {
              id: true,
              username: true,
            },
          },
          announcements: {
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
              remarks: true,
              createdAt: true,
              teacher: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          },
          assignments: {
            select: {
              id: true,
              title: true,
              dueDate: true,
              createdAt: true,
              weight: true,
              graded: true,
              maxGrade: true,      
              section: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      const sections = await prisma.section.findMany({
        where: {
          classId: classId,
        },
      });

      if (!classData) {
        throw new Error('Class not found');
      }

      return {
        class: {
          ...classData,
          sections,
        },
      };
    }),
  update: protectedTeacherProcedure
    .input(z.object({
      classId: z.string(),
      name: z.string().optional(),
      section: z.string().optional(),
      subject: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { classId, ...updateData } = input;
      
      const updatedClass = await prisma.class.update({
        where: {
          id: classId,
          teachers: {
            some: {
              id: ctx.user?.id,
            },
          },
        },
        data: updateData,
        select: {
          id: true,
          name: true,
          section: true,
          subject: true,
        }
      });

      return {
        updatedClass,
      }
    }),
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      section: z.string(),
      subject: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
        const newClass = await prisma.class.create({
        data: {
          name: input.name,
          section: input.section,
          subject: input.subject,
          teachers: {
            connect: {
              id: ctx.user?.id,
            },
          },
        },
        select: {
          id: true,
          name: true,
          section: true,
          subject: true,
        }
      });

      return {
        newClass,
      }
    }),
  delete: protectedTeacherProcedure
    .input(z.object({
      classId: z.string(),
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user is the teacher of this class
      const classToDelete = await prisma.class.findFirst({
        where: {
          id: input.id,
        },
      });

      if (!classToDelete) {
        throw new Error("Class not found or you don't have permission to delete it");
      }

      await prisma.class.delete({
        where: {
          id: input.id,
        },
      });

      return {
        deletedClass: {
          id: input.id,
        }
      }
    }),
  addStudent: protectedTeacherProcedure
    .input(z.object({
      classId: z.string(),
      studentId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { classId, studentId } = input;

      const student = await prisma.user.findUnique({
        where: {
          id: studentId,
        },
      });

      if (!student) {
        throw new Error("Student not found");
      }

      const updatedClass = await prisma.class.update({
        where: {
          id: classId,
        },
        data: {
          students: {
            connect: {
              id: studentId,
            },
          },
        },
        select: {
          id: true,
          name: true,
          section: true,
          subject: true,
        }
      });

      return {
        updatedClass,
        newStudent: student,
      }
    }),
  changeRole: protectedTeacherProcedure
    .input(z.object({
      classId: z.string(),
      userId: z.string(),
      type: z.enum(['teacher', 'student']),
    }))
    .mutation(async ({ ctx, input }) => {
      const { classId, userId, type } = input;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const updatedClass = await prisma.class.update({
        where: { id: classId },
        data: {
          [type === 'teacher' ? 'teachers' : 'students']: {
            connect: { id: userId },
          },
          [type === 'teacher' ? 'students' : 'teachers']: {
            disconnect: { id: userId },
          },
        },
      });

      return {
        updatedClass,
        user: {
          ...user,
          type,
        },
      };
    }),
  removeMember: protectedTeacherProcedure
    .input(z.object({
      classId: z.string(),
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { classId, userId } = input;

      const updatedClass = await prisma.class.update({
        where: { id: classId },
        data: {
          teachers: {
            disconnect: { id: userId },
          },
          students: {
            disconnect: { id: userId },
          },
        },
      });

      return {
        updatedClass,
        removedUserId: userId,
      };
    }),
  join: protectedProcedure
    .input(z.object({
      classCode: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { classCode } = input;

      const session = await prisma.session.findFirst({
        where: {
          id: classCode,
        },
      });

      if (!session || !session.classId) {
        throw new Error("Class not found");
      }

      if (session.expiresAt && session.expiresAt < new Date()) {
        throw new Error("Session expired");
      }

      const updatedClass = await prisma.class.update({
        where: { id: session.classId },
        data: {
          students: {
            connect: { id: ctx.user?.id },
          },
        },
        select: {
          id: true,
          name: true,
          section: true,
          subject: true,
        },
      });

      return {
        joinedClass: updatedClass,
      }
    }),
  getInviteCode: protectedTeacherProcedure
    .input(z.object({
      classId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { classId } = input;

      const session = await prisma.session.findFirst({
        where: {
          classId,
        },
      });

      if (session?.expiresAt && session.expiresAt < new Date()) {
        const newSession = await prisma.session.create({
          data: {
            id: generateInviteCode(),
            classId,
            expiresAt: new Date(Date.now() +  24 * 60 * 60 * 1000), // 24 hours from now
      }
        });
        return {
          code: newSession.id,
        }
      }

      return {
        code: session?.id,
      };
    }),
  createInviteCode: protectedTeacherProcedure
    .input(z.object({
      classId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { classId } = input;

      // Create a new session for the invite code
      const session = await prisma.session.create({
        data: {
          id: generateInviteCode(),
          classId,
          expiresAt: new Date(Date.now() +  24 * 60 * 60 * 1000), // 24 hours from now
        }
      });

      return {
        code: session.id,
      };
    }),
  getGrades: protectedClassMemberProcedure
    .input(z.object({
      classId: z.string(),
      userId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { classId, userId } = input;

      const isTeacher = await prisma.class.findFirst({
        where: {
          id: classId,
          teachers: {
            some: { id: ctx.user?.id }
          }
        }
      });
      // If student, only allow viewing their own grades
      if (ctx.user?.id !== userId && !isTeacher) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You can only view your own grades',
        });
      }

      const grades = await prisma.submission.findMany({
        where: {
          studentId: userId,
          assignment: {
            classId: classId,
            graded: true
          }
        },
        include: {
          assignment: {
            select: {
              id: true,
              title: true,
              maxGrade: true,
              weight: true,
            }
          },
        }
      });

      return {
        grades,
      };
    }),
  updateGrade: protectedTeacherProcedure
    .input(z.object({
      classId: z.string(),
      assignmentId: z.string(),
      submissionId: z.string(),
      gradeReceived: z.number().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { classId, assignmentId, submissionId, gradeReceived } = input;

      // Update the grade
      const updatedSubmission = await prisma.submission.update({
        where: {
          id: submissionId,
          assignmentId: assignmentId,
        },
        data: {
          gradeReceived,
        },
        include: {
          assignment: {
            select: {
              id: true,
              title: true,
              maxGrade: true,
              weight: true,
            }
        }
      }
      });

      return updatedSubmission;
    }),
});