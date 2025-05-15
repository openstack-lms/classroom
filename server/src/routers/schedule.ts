import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { prisma } from "@lib/prisma";

const scheduleSchema = z.object({
  name: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  institutionId: z.string(),
  type: z.string(),
  description: z.string().optional(),
});

export const scheduleRouter = createTRPCRouter({
  create: protectedProcedure
    .input(scheduleSchema)
    .mutation(async ({ ctx, input }) => {
      const schedule = await prisma.schedule.create({
        data: {
          name: input.name,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          institutionId: input.institutionId,
          type: input.type,
          description: input.description,
        },
        include: {
          institution: true,
        },
      });

      return schedule;
    }),

  update: protectedProcedure
    .input(scheduleSchema.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const schedule = await prisma.schedule.update({
        where: { id },
        data: {
          ...data,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
        },
        include: {
          institution: true,
        },
      });

      return schedule;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await prisma.schedule.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const schedule = await prisma.schedule.findUnique({
        where: { id: input.id },
        include: {
          institution: true,
        },
      });

      if (!schedule) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Schedule not found",
        });
      }

      return schedule;
    }),

  list: protectedProcedure
    .input(z.object({
      institutionId: z.string(),
      type: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const schedules = await prisma.schedule.findMany({
        where: {
          institutionId: input.institutionId,
          ...(input.type ? { type: input.type } : {}),
          ...(input.startDate ? {
            startDate: {
              gte: new Date(input.startDate),
            },
          } : {}),
          ...(input.endDate ? {
            endDate: {
              lte: new Date(input.endDate),
            },
          } : {}),
        },
        include: {
          institution: true,
        },
        orderBy: {
          startDate: 'asc',
        },
      });

      return schedules;
    }),

  getAcademicCalendar: protectedProcedure
    .input(z.object({
      institutionId: z.string(),
      academicYear: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const schedules = await prisma.schedule.findMany({
        where: {
          institutionId: input.institutionId,
          type: 'ACADEMIC',
          startDate: {
            gte: new Date(`${input.academicYear}-01-01`),
            lte: new Date(`${input.academicYear}-12-31`),
          },
        },
        include: {
          institution: true,
        },
        orderBy: {
          startDate: 'asc',
        },
      });

      return schedules;
    }),
}); 