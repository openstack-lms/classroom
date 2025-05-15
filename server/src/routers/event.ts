import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { prisma } from "@lib/prisma";

const eventSchema = z.object({
  name: z.string().optional(),
  location: z.string().optional(),
  remarks: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  classId: z.string().optional(),
});

export const eventRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to get an event",
        });
      }

      const event = await prisma.event.findUnique({
        where: { id: input.id },
        include: {
          class: true,
          user: true,
        },
      });

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      if (event.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to view this event",
        });
      }

      return { event };
    }),

  create: protectedProcedure
    .input(eventSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to create an event",
        });
      }

      // If classId is provided, check if user is a teacher of the class
      if (input.classId) {
        const classData = await prisma.class.findUnique({
          where: {
            id: input.classId,
            teachers: {
              some: {
                id: ctx.user.id,
              },
            },
          },
        });

        if (!classData) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You are not authorized to create events for this class",
          });
        }
      }

      const event = await prisma.event.create({
        data: {
          name: input.name,
          location: input.location,
          remarks: input.remarks,
          startTime: new Date(input.startTime),
          endTime: new Date(input.endTime),
          userId: ctx.user.id,
          ...(input.classId ? { classId: input.classId } : {}),
        },
      });

      return { event };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: eventSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to update an event",
        });
      }

      const event = await prisma.event.findUnique({
        where: { id: input.id },
      });

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      if (event.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to update this event",
        });
      }

      const updatedEvent = await prisma.event.update({
        where: { id: input.id },
        data: {
          name: input.data.name,
          location: input.data.location,
          remarks: input.data.remarks,
          startTime: new Date(input.data.startTime),
          endTime: new Date(input.data.endTime),
          ...(input.data.classId ? { classId: input.data.classId } : {}),
        },
      });

      return { event: updatedEvent };
    }),

  delete: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to delete an event",
        });
      }

      const event = await prisma.event.findUnique({
        where: { id: input.id },
      });

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      if (event.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this event",
        });
      }

      await prisma.event.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
}); 