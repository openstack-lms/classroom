// import { z } from 'zod';
// import { createTRPCRouter, protectedProcedure, protectedClassMemberProcedure, protectedTeacherProcedure } from '@/trpc';
// import { TRPCError } from '@trpc/server';
// import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
// import { prisma } from '@lib/prisma';

// // Custom error types
// const ClassNotFoundError = new TRPCError({
//   code: 'NOT_FOUND',
//   message: 'Class not found',
// });

// const DatabaseError = new TRPCError({
//   code: 'INTERNAL_SERVER_ERROR',
//   message: 'Database operation failed',
// });

// // Zod schemas
// const createClassSchema = z.object({
//   name: z.string(),
//   section: z.string(),
//   subject: z.string(),
// });

// const updateClassSchema = z.object({
//   id: z.string(),
//   name: z.string(),
//   section: z.string(),
//   subject: z.string(),
// });

// const deleteClassSchema = z.object({
//   id: z.string(),
// });

// const joinClassSchema = z.object({
//   code: z.string(),
// });

// export const classesRouter = createTRPCRouter({
//   getAll: protectedProcedure.query(async ({ ctx }) => {
//     const { user } = ctx;

//     const teacherInClass = await prisma.class.findMany({
//       where: { teachers: { some: { id: user?.id } } },
//     });

//     const studentInClass = await prisma.class.findMany({
//       where: { students: { some: { id: user?.id } } },
//     });

//     return {
//       teacherInClass,
//       studentInClass,
//     };
//   }),
//   create: protectedProcedure
//     .input(createClassSchema)
//     .mutation(async ({ ctx, input }) => {
//       const { name, section, subject } = input;
//       const { user } = ctx;

//       const newClass = await prisma.class.create({
//         data: {
//           name,
//           section,
//           subject,
//           teachers: {
//             connect: { id: user!.id },
//           },
//         },
//       });

//       return {
//         success: true,
//         payload: {
//           class: newClass,
//         },
//       };
//     }),
//     update: protectedProcedure.input(updateClassSchema).mutation(async ({ ctx, input }) => {
//       const { id, name, section, subject } = input;
//       const { user } = ctx;

//       const updatedClass = await prisma.class.update({
//         where: { id, teachers: { some: { id: user!.id } } },
//         data: { name, section, subject },
//       });

//       return {
//         success: true,
//         payload: { class: updatedClass },
//       };
//     }),
//     delete: protectedProcedure.input(deleteClassSchema).mutation(async ({ ctx, input }) => {
//       const { id } = input;
//       const { user } = ctx;

//       await prisma.class.delete({
//         where: { id, teachers: { some: { id: user!.id } } },
//       });

//       return {
//         success: true,
//       };
//     }),

//     // abstractions
//     join: protectedProcedure.input(joinClassSchema).mutation(async ({ ctx, input }) => {
//       const { code } = input;
//       const { user } = ctx;
      
//       const session = await prisma.session.findFirst({
//         where: {
//           id: code,
//         },
//       });

//       if (!session) {
//         throw new TRPCError({ code: 'NOT_FOUND', message: 'Class not found' });
//       }

//       const classToJoin = await prisma.class.findUnique({
//         where: { id: session.classId! },
//       });

//       if (!classToJoin) {
//         throw new TRPCError({ code: 'NOT_FOUND', message: 'Class not found' });
//       }
      
//       await prisma.class.update({
//         where: { id: classToJoin.id },
//         data: {
//           students: {
//             connect: { id: user!.id },
//           },
//         },
//       });
      
//     }),

// });

// // Export type definitions
// export type ClassesRouter = typeof classesRouter;
// export type ClassesRouterInput = inferRouterInputs<ClassesRouter>;
// export type ClassesRouterOutput = inferRouterOutputs<ClassesRouter>; 