import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      path: '/socket.io/',
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      forceNew: true,
      autoConnect: true,
      rejectUnauthorized: false,
      extraHeaders: {
        'Access-Control-Allow-Origin': '*'
      },
      timeout: 10000,
      autoUnref: false,
      randomizationFactor: 0.5
    });

    socket.on('connect', () => {
      console.log('[Client] Socket connected:', socket?.id);
      console.log('[Client] Socket transport:', socket?.io.engine.transport.name);
      console.log('[Client] Socket state:', {
        connected: socket?.connected,
        id: socket?.id,
        transport: socket?.io.engine.transport.name,
        readyState: socket?.io.engine.readyState
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('[Client] Socket disconnected:', reason);
      console.log('[Client] Socket state:', {
        connected: socket?.connected,
        id: socket?.id,
        transport: socket?.io.engine.transport.name,
        readyState: socket?.io.engine.readyState
      });
    });

    socket.on('connect_error', (error) => {
      console.error('[Client] Socket connection error:', error);
      console.log('[Client] Socket state:', {
        connected: socket?.connected,
        id: socket?.id,
        transport: socket?.io.engine.transport.name,
        readyState: socket?.io.engine.readyState
      });
    });

    socket.on('error', (error) => {
      console.error('[Client] Socket error:', error);
      console.log('[Client] Socket state:', {
        connected: socket?.connected,
        id: socket?.id,
        transport: socket?.io.engine.transport.name,
        readyState: socket?.io.engine.readyState
      });
    });

  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const joinClass = (classId: string) => {
  const socket = getSocket();
  socket.emit('join-class', classId);
};

export const leaveClass = (classId: string) => {
  const socket = getSocket();
  socket.emit('leave-class', classId);
};

export const emitNewAnnouncement = (classId: string, announcement: any) => {
  const socket = getSocket();
  socket.emit('new-announcement', { classId, announcement }, (response: { success: boolean, error?: string }) => {
    if (!response.success) {
      console.error('Failed to create announcement:', response.error);
    }
  });
};

export const emitAssignmentUpdate = (classId: string, assignment: any) => {
  const socket = getSocket();
  socket.emit('assignment-update', { classId, assignment }, (response: { success: boolean, error?: string }) => {
    if (!response.success) {
      console.error('Failed to update assignment:', response.error);
    }
  });
};

export const emitAssignmentCreate = (classId: string, assignment: any) => {
  const socket = getSocket();
  socket.emit('assignment-create', { classId, assignment }, (response: { success: boolean, error?: string }) => {
    if (!response.success) {
      console.error('Failed to create assignment:', response.error);
    }
  });
};

export const emitAssignmentDelete = (classId: string, assignmentId: string) => {
  const socket = getSocket();
  socket.emit('assignment-delete', { classId, assignmentId }, (response: { success: boolean, error?: string }) => {
    if (!response.success) {
      console.error('Failed to delete assignment:', response.error);
    }
  });
};

export const emitSubmissionUpdate = (classId: string, submission: any) => {
  const socket = getSocket();
  socket.emit('submission-update', { classId, submission }, (response: { success: boolean, error?: string }) => {
    if (!response.success) {
      console.error('Failed to update submission:', response.error);
    }
  });
};

export const emitSectionCreate = (classId: string, section: any) => {
  const socket = getSocket();
  socket.emit('section-create', { classId, section }, (response: { success: boolean, error?: string }) => {
    if (!response.success) {
      console.error('Failed to create section:', response.error);
    }
  });
};

export const emitSectionUpdate = (classId: string, section: any) => {
  const socket = getSocket();
  socket.emit('section-update', { classId, section }, (response: { success: boolean, error?: string }) => {
    if (!response.success) {
      console.error('Failed to update section:', response.error);
    }
  });
};

export const emitSectionDelete = (classId: string, sectionId: string) => {
  const socket = getSocket();
  socket.emit('section-delete', { classId, sectionId }, (response: { success: boolean, error?: string }) => {
    if (!response.success) {
      console.error('Failed to delete section:', response.error);
    }
  });
}; 

export const emitMemberUpdate = (classId: string, member: any) => {
  const socket = getSocket();
  socket.emit('member-update', { classId, member });
};

export const emitMemberDelete = (classId: string, memberId: string) => {
  const socket = getSocket();
  socket.emit('member-delete', { classId, memberId });
};

export const emitAttendanceUpdate = (classId: string, attendance: any) => {
  const socket = getSocket();
  socket.emit('attendance-update', { classId, attendance });
};