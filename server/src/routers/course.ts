import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { prisma } from "@lib/prisma";

const courseSchema = z.object({
  code: z.string(),
  name: z.string(),
  description: z.string().optional(),
  credits: z.number().int().positive(),
  departmentId: z.string(),
  institutionId: z.string(),
  prerequisites: z.array(z.string()).optional(),
  syllabus: z.any().optional(),
});

export const courseRouter = createTRPCRouter({
  create: protectedProcedure
    .input(courseSchema)
    .mutation(async ({ ctx, input }) => {
      const course = await prisma.course.create({
        data: {
          code: input.code,
          name: input.name,
          description: input.description,
          credits: input.credits,
          departmentId: input.departmentId,
          institutionId: input.institutionId,
          prerequisites: input.prerequisites,
          syllabus: input.syllabus,
        },
        include: {
          department: true,
          institution: true,
        },
      });

      return course;
    }),

  update: protectedProcedure
    .input(courseSchema.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const course = await prisma.course.update({
        where: { id },
        data,
        include: {
          department: true,
          institution: true,
        },
      });

      return course;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await prisma.course.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const course = await prisma.course.findUnique({
        where: { id: input.id },
        include: {
          department: true,
          institution: true,
        },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      return course;
    }),

  list: protectedProcedure
    .input(z.object({
      institutionId: z.string(),
      departmentId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const courses = await prisma.course.findMany({
        where: {
          institutionId: input.institutionId,
          ...(input.departmentId ? { departmentId: input.departmentId } : {}),
        },
        include: {
          department: true,
          institution: true,
        },
      });

      return courses;
    }),

  search: protectedProcedure
    .input(z.object({
      query: z.string(),
      institutionId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const courses = await prisma.course.findMany({
        where: {
          institutionId: input.institutionId,
          OR: [
            { name: { contains: input.query, mode: 'insensitive' } },
            { code: { contains: input.query, mode: 'insensitive' } },
            { description: { contains: input.query, mode: 'insensitive' } },
          ],
        },
        include: {
          department: true,
          institution: true,
        },
      });

      return courses;
    }),
}); 