import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { prisma } from "@lib/prisma";

const departmentSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  headId: z.string().optional(),
  institutionId: z.string(),
});

export const departmentRouter = createTRPCRouter({
  create: protectedProcedure
    .input(departmentSchema)
    .mutation(async ({ ctx, input }) => {
      const department = await prisma.department.create({
        data: {
          name: input.name,
          description: input.description,
          headId: input.headId,
          institutionId: input.institutionId,
        },
        include: {
          head: true,
          teachers: true,
          courses: true,
        },
      });

      return department;
    }),

  update: protectedProcedure
    .input(departmentSchema.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const department = await prisma.department.update({
        where: { id },
        data,
        include: {
          head: true,
          teachers: true,
          courses: true,
        },
      });

      return department;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await prisma.department.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const department = await prisma.department.findUnique({
        where: { id: input.id },
        include: {
          head: true,
          teachers: true,
          courses: true,
          institution: true,
        },
      });

      if (!department) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Department not found",
        });
      }

      return department;
    }),

  list: protectedProcedure
    .input(z.object({ institutionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const departments = await prisma.department.findMany({
        where: { institutionId: input.institutionId },
        include: {
          head: true,
          teachers: true,
          courses: true,
        },
      });

      return departments;
    }),

  addTeacher: protectedProcedure
    .input(z.object({
      departmentId: z.string(),
      teacherId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const department = await prisma.department.update({
        where: { id: input.departmentId },
        data: {
          teachers: {
            connect: { id: input.teacherId },
          },
        },
        include: {
          teachers: true,
        },
      });

      return department;
    }),

  removeTeacher: protectedProcedure
    .input(z.object({
      departmentId: z.string(),
      teacherId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const department = await prisma.department.update({
        where: { id: input.departmentId },
        data: {
          teachers: {
            disconnect: { id: input.teacherId },
          },
        },
        include: {
          teachers: true,
        },
      });

      return department;
    }),
}); 