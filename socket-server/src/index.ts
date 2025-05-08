import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Access-Control-Allow-Origin']
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  path: '/socket.io/',
  allowEIO3: true
});

// Add server-level logging
io.engine.on('connection_error', (err) => {
  console.error('[Server] Connection error:', err.message);
});

io.on('connection', (socket) => {
  console.log(`[Server] Client connected: ${socket.id}`);

  socket.on('disconnect', (reason) => {
    console.log(`[Server] Client disconnected: ${socket.id} (${reason})`);
  });

  socket.on('error', (error) => {
    console.error(`[Server] Socket error:`, error);
  });

  // Join a class room
  socket.on('join-class', (classId: string, callback) => {
    try {
      socket.join(`class-${classId}`);
      if (callback) {
        callback(classId);
      } else {
        socket.emit('joined-class', classId);
      }
    } catch (error) {
      console.error(`[Server] Error joining class room:`, error);
      if (callback) {
        callback(null);
      }
    }
  });

  // Handle new assignments
  socket.on('assignment-create', (data: { classId: string, assignment: any }) => {
    if (data.classId && data.assignment) {
      io.to(`class-${data.classId}`).emit('assignment-created', data.assignment);
    } else {
      console.error('[Server] Invalid assignment data format');
    }
  });

  // Handle assignment updates
  socket.on('assignment-update', (data: { classId: string, assignment: any }) => {
    io.to(`class-${data.classId}`).emit('assignment-updated', data.assignment);
  });

  // Handle assignment deletions
  socket.on('assignment-delete', (data: { classId: string, assignmentId: string }) => {
    io.to(`class-${data.classId}`).emit('assignment-deleted', data.assignmentId);
  });

  // Handle submission updates
  socket.on('submission-update', (data: { classId: string, submission: any }) => {
    io.to(`class-${data.classId}`).emit('submission-updated', data.submission);
  });

  // Handle new announcements
  socket.on('new-announcement', (data: { classId: string, announcement: any }) => {
    io.to(`class-${data.classId}`).emit('announcement-created', data.announcement);
  });

  // Handle section creation
  socket.on('section-create', (data: { classId: string, section: any }) => {
    io.to(`class-${data.classId}`).emit('section-created', data.section);
  });

  // Handle section updates
  socket.on('section-update', (data: { classId: string, section: any }) => {
    io.to(`class-${data.classId}`).emit('section-updated', data.section);
  });

  // Handle section deletions
  socket.on('section-delete', (data: { classId: string, sectionId: string }) => {
    io.to(`class-${data.classId}`).emit('section-deleted', data.sectionId);
  });

  // Handle member role changes
  socket.on('member-update', (data: { classId: string, member: any }) => {
    io.to(`class-${data.classId}`).emit('member-updated', data.member);
  });

  // Handle member removals
  socket.on('member-delete', (data: { classId: string, memberId: string }) => {
    io.to(`class-${data.classId}`).emit('member-deleted', data.memberId);
  });

  // Handle attendance updates
  socket.on('attendance-update', (data: { classId: string, attendance: any }) => {
    io.to(`class-${data.classId}`).emit('attendance-updated', data.attendance);
  });
});

const PORT = process.env.SOCKET_SERVER_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`[Server] Socket server running on port ${PORT}`);
}); 