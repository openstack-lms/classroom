import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { prisma } from "@lib/prisma";
import { v4 as uuidv4 } from 'uuid';

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input }) => {
      const { username, password } = input;

      const user = await prisma.user.findFirst({
        where: { username },
        select: {
          id: true,
          username: true,
          password: true,
          institutionId: true,
          institution: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }

      // TODO: Add proper password hashing
      if (user.password !== password) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }

      // Create a new session
      const session = await prisma.session.create({
        data: {
          id: uuidv4(),
          userId: user.id,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        },
      });

      return {
        token: session.id,
        user: {
          id: user.id,
          username: user.username,
          institutionId: user.institutionId,
          institution: user.institution,
        },
      };
    }),

  check: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: {
          id: true,
          username: true,
          institutionId: true,
          institution: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return {user};
    }),
}); 