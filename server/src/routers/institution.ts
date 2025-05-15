import { z } from "zod";
import { createTRPCRouter, protectedProcedure, protectedInstitutionAdminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { prisma } from "@lib/prisma";

const settingsSchema = z.object({
  name: z.string(),
  email: z.string().email().optional(),
  autoSendTranscripts: z.boolean(),
  transcriptEmailTemplate: z.string().optional(),
  gradeReleasePolicy: z.enum(['immediate', 'manual', 'scheduled']),
  gradeReleaseSchedule: z.string().optional(),
  allowStudentRegistration: z.boolean(),
  requireTeacherApproval: z.boolean(),
  notificationPreferences: z.object({
    email: z.boolean(),
    push: z.boolean(),
    gradeUpdates: z.boolean(),
    assignmentUpdates: z.boolean(),
    announcementUpdates: z.boolean(),
  }),
  securitySettings: z.object({
    requireTwoFactor: z.boolean(),
    sessionTimeout: z.number().min(5).max(1440),
    passwordPolicy: z.object({
      minLength: z.number().min(8).max(32),
      requireSpecialChar: z.boolean(),
      requireNumbers: z.boolean(),
    }),
  }),
});

export const institutionRouter = createTRPCRouter({
  // Create a new institution and assign the creator as admin
  create: protectedProcedure.input(z.object({
    name: z.string(),
  })).mutation(async ({ ctx, input }) => {
    const { name } = input;
    const institute = await prisma.institution.create({
      data: {
        name,
        admins: {
          connect: {
            id: ctx.user!.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
      }
    });
    return { institute };
  }),

  // Add a class to an institution
  addClass: protectedInstitutionAdminProcedure.input(z.object({
    name: z.string(),
    institutionId: z.string(),
    subject: z.string(),
    section: z.string(),
  })).mutation(async ({ ctx, input }) => {
    const { name, institutionId, subject, section } = input;
    const institute = await prisma.institution.findUnique({
      where: { id: institutionId },
    });
    if (!institute) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Institute not found",
      });
    }
    const newClass = await prisma.class.create({
      data: {
        name,
        institution: { connect: { id: institutionId } },
        subject,
        section,
      },
      select: {
        id: true,
        name: true,
        subject: true,
        section: true,
      },
    });
    return { class: newClass };
  }),

  // Get all classes for an institution
  getClasses: protectedInstitutionAdminProcedure.input(z.object({
    institutionId: z.string(),
  })).query(async ({ ctx, input }) => {
    const { institutionId } = input;
    const classes = await prisma.class.findMany({
      where: { institutionId },
      include: {
        teachers: true,
        students: true,
      },
    });
    return { classes };
  }),

  // Get all users for an institution
  getUsers: protectedInstitutionAdminProcedure.input(z.object({
    institutionId: z.string(),
  })).query(async ({ ctx, input }) => {
    const { institutionId } = input;
    const users = await prisma.user.findMany({
      where: { institutionId },
    });
    return { users };
  }),

  // Get institution details (with classes, teachers, students, etc.)
  get: protectedProcedure
    .input(z.object({
      institutionId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const institution = await prisma.institution.findUnique({
        where: { id: input.institutionId },
        include: {
          classes: {
            include: {
              students: true,
            },
          },
          teachers: {
            include: {
              departmentTeacher: true,
            },
          },
          students: {
            include: {
              studentIn: true,
            },
          },
        },
      });
      if (!institution) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Institution not found",
        });
      }
      return institution;
    }),

  // Update institution settings
  updateSettings: protectedProcedure
    .input(z.object({
      institutionId: z.string(),
      settings: settingsSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const institution = await prisma.institution.findUnique({
        where: { id: input.institutionId },
      });
      if (!institution) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Institution not found",
        });
      }
      // Update institution settings
      const updatedInstitution = await prisma.institution.update({
        where: { id: input.institutionId },
        data: {
          name: input.settings.name,
          settings: input.settings, // Store all settings in a JSON field
        },
      });
      return updatedInstitution;
    }),

  // Department Management
  createDepartment: protectedInstitutionAdminProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      institutionId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const department = await prisma.department.create({
        data: {
          name: input.name,
          description: input.description,
          institution: { connect: { id: input.institutionId } },
        },
      });
      return { department };
    }),

  getDepartments: protectedProcedure
    .input(z.object({
      institutionId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const departments = await prisma.department.findMany({
        where: { institutionId: input.institutionId },
        include: {
          courses: true,
          teachers: true,
        },
      });
      return { departments };
    }),

  deleteDepartment: protectedInstitutionAdminProcedure
    .input(z.object({
      departmentId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const department = await prisma.department.findUnique({
        where: { id: input.departmentId },
        include: {
          courses: true,
          teachers: true,
        },
      });

      if (!department) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Department not found",
        });
      }

      // Check if department has any courses or teachers
      if (department.courses.length > 0 || department.teachers.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete department with existing courses or teachers",
        });
      }

      await prisma.department.delete({
        where: { id: input.departmentId },
      });

      return { success: true };
    }),

  // Course Management
  createCourse: protectedInstitutionAdminProcedure
    .input(z.object({
      name: z.string(),
      code: z.string(),
      description: z.string().optional(),
      departmentId: z.string(),
      credits: z.number().min(0).max(10),
      institutionId: z.string(),
    }))
    .mutation(async ({ ctx, input, }) => {
      const course = await prisma.course.create({
        data: {
          name: input.name,
          code: input.code,
          description: input.description,
          credits: input.credits,
          department: { connect: { id: input.departmentId } },
          institution: { connect: { id: input.institutionId } },
        },
      });
      return { course };
    }),

  getCourses: protectedProcedure
    .input(z.object({
      departmentId: z.string().optional(),
      institutionId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const courses = await prisma.course.findMany({
        where: {
          department: {
            institutionId: input.institutionId,
            ...(input.departmentId ? { id: input.departmentId } : {}),
          },
        },
        include: {
          department: true,
        },
      });
      return { courses };
    }),

  // Dashboard Statistics
  getDashboardStats: protectedProcedure
    .input(z.object({
      institutionId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const stats = await prisma.$transaction([
        prisma.user.count({
          where: {
            institutionId: input.institutionId,
            role: 'STUDENT',
          },
        }),
        prisma.user.count({
          where: {
            institutionId: input.institutionId,
            role: 'TEACHER',
          },
        }),
        prisma.class.count({
          where: {
            institutionId: input.institutionId,
          },
        }),
        prisma.department.count({
          where: {
            institutionId: input.institutionId,
          },
        }),
        prisma.course.count({
          where: {
            institutionId: input.institutionId,
          },
        }),
      ]);

      // Get enrollment trends for the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const enrollmentTrends = await prisma.$transaction([
        // Get student enrollments by month
        prisma.user.groupBy({
          by: ['enrollmentDate'],
          where: {
            institutionId: input.institutionId,
            role: 'STUDENT',
            enrollmentDate: {
              gte: sixMonthsAgo,
            },
          },
          _count: {
            _all: true
          },
          orderBy: {
            enrollmentDate: 'asc'
          }
        }),
        // Get teacher enrollments by month
        prisma.user.groupBy({
          by: ['enrollmentDate'],
          where: {
            institutionId: input.institutionId,
            role: 'TEACHER',
            enrollmentDate: {
              gte: sixMonthsAgo,
            },
          },
          _count: {
            _all: true
          },
          orderBy: {
            enrollmentDate: 'asc'
          }
        }),
      ]);

      // Get department distribution
      const departmentDistribution = await prisma.department.findMany({
        where: {
          institutionId: input.institutionId,
        },
        include: {
          _count: {
            select: {
              courses: true,
            },
          },
        },
      });

      return {
        stats: {
          totalStudents: stats[0],
          totalTeachers: stats[1],
          totalClasses: stats[2],
          totalDepartments: stats[3],
          totalCourses: stats[4],
        },
        enrollmentTrends: {
          students: enrollmentTrends[0],
          teachers: enrollmentTrends[1],
        },
        departmentDistribution: departmentDistribution.map(dept => ({
          name: dept.name,
          value: dept._count.courses,
        })),
      };
    }),

  // Teacher Management
  getTeachers: protectedProcedure
    .input(z.object({
      institutionId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const teachers = await prisma.user.findMany({
        where: {
          institutionId: input.institutionId,
          role: 'TEACHER',
        },
        select: {
          id: true,
          username: true,
          profile: true,
          departmentTeacher: true,
        },
      });
      return { teachers };
    }),

  createTeacher: protectedInstitutionAdminProcedure
    .input(z.object({
      name: z.string(),
      email: z.string().email(),
      departmentId: z.string().optional(),
      institutionId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const teacher = await prisma.user.create({
        data: {
          username: input.email,
          password: "", // This should be handled by a separate password setup flow
          role: 'TEACHER',
          profile: { name: input.name },
          institution: { connect: { id: input.institutionId } },
          ...(input.departmentId ? {
            departmentTeacher: { connect: { id: input.departmentId } },
          } : {}),
        },
      });
      return { teacher };
    }),

  deleteTeacher: protectedInstitutionAdminProcedure
    .input(z.object({
      teacherId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const teacher = await prisma.user.findUnique({
        where: { id: input.teacherId },
        include: {
          teacherIn: true,
        },
      });

      if (!teacher) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Teacher not found",
        });
      }

      if (teacher.teacherIn.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete teacher with assigned classes",
        });
      }

      await prisma.user.delete({
        where: { id: input.teacherId },
      });

      return { success: true };
    }),

  // Student Management
  getStudents: protectedProcedure
    .input(z.object({
      institutionId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const students = await prisma.user.findMany({
        where: {
          institutionId: input.institutionId,
          role: 'STUDENT',
        },
        select: {
          id: true,
          username: true,
          profile: true,
          studentIn: true,
        },
      });
      return { students };
    }),

  createStudent: protectedInstitutionAdminProcedure
    .input(z.object({
      name: z.string(),
      email: z.string().email(),
      studentId: z.string().optional(),
      institutionId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const student = await prisma.user.create({
        data: {
          username: input.email,
          password: "", // This should be handled by a separate password setup flow
          role: 'STUDENT',
          profile: { 
            name: input.name,
            studentId: input.studentId,
          },
          institution: { connect: { id: input.institutionId } },
        },
      });
      return { student };
    }),

  deleteStudent: protectedInstitutionAdminProcedure
    .input(z.object({
      studentId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const student = await prisma.user.findUnique({
        where: { id: input.studentId },
        include: {
          studentIn: true,
        },
      });

      if (!student) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student not found",
        });
      }

      if (student.studentIn.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete student with enrolled classes",
        });
      }

      await prisma.user.delete({
        where: { id: input.studentId },
      });

      return { success: true };
    }),
}); 