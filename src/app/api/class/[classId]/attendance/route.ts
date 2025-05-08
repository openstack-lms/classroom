import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ApiResponse } from "@/interfaces/api/Response";
import { ApiResponseRemark } from "@/lib/ApiResponseRemark";

interface GetAttendanceResponse {
  attendance: {
    id: string;
    date: Date;
    event?: {
      id: string;
      name: string | null;
      startTime: Date;
      endTime: Date;
      location: string | null;
    } | null;
    present: { id: string; username: string }[];
    late: { id: string; username: string }[];
    absent: { id: string; username: string }[];
  }[];
}

interface CreateAttendanceRequest {
  date: string;
  eventId?: string;
  present: { id: string; username: string }[];
  late: { id: string; username: string }[];
  absent: { id: string; username: string }[];
}

export async function GET(
  request: Request,
  { params }: { params: { classId: string } }
): Promise<NextResponse<ApiResponse<GetAttendanceResponse>>> {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const userId = await getUserFromToken(token || null);

  if (!userId) {
    return NextResponse.json({
      success: false,
      payload: {
        remark: ApiResponseRemark.UNAUTHORIZED,
      },
    });
  }

  // Check if user is a teacher of the class
  const classData = await prisma.class.findUnique({
    where: {
      id: params.classId,
      OR: [
        {
          teachers: {
            some: {
              id: userId,
            },
          },
        },
        {
          students: {
            some: {
              id: userId,
            },
          },
        },
      ],
    },
  });

  if (!classData) {
    return NextResponse.json({
      success: false,
      payload: {
        remark: ApiResponseRemark.UNAUTHORIZED,
      },
    });
  }

  // Get eventId from query params if provided
  const url = new URL(request.url);
  const eventId = url.searchParams.get('eventId');

  const attendance = await prisma.attendance.findMany({
    where: {
      classId: params.classId,
      ...(eventId ? { eventId } : {}),
    },
    include: {
      event: {
        select: {
          id: true,
          name: true,
          startTime: true,
          endTime: true,
          location: true,
        },
      },
      present: {
        select: {
          id: true,
          username: true,
        },
      },
      late: {
        select: {
          id: true,
          username: true,
        },
      },
      absent: {
        select: {
          id: true,
          username: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  });

  return NextResponse.json({
    success: true,
    payload: {
      attendance,
    },
  });
}

export async function PUT(
  request: Request,
  { params }: { params: { classId: string } }
): Promise<NextResponse<ApiResponse<any>>> {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const userId = await getUserFromToken(token || null);
  const body: CreateAttendanceRequest = await request.json();

  if (!userId) {
    return NextResponse.json({
      success: false,
      payload: {
        remark: ApiResponseRemark.UNAUTHORIZED,
      },
    });
  }

  // Check if user is a teacher of the class
  const classData = await prisma.class.findUnique({
    where: {
      id: params.classId,
      teachers: {
        some: {
          id: userId,
        },
      },
    },
  });

  if (!classData) {
    return NextResponse.json({
      success: false,
      payload: {
        remark: ApiResponseRemark.UNAUTHORIZED,
      },
    });
  }

  // If eventId is provided, verify it belongs to the class
  if (body.eventId) {
    const event = await prisma.event.findFirst({
      where: {
        id: body.eventId,
        classId: params.classId,
      },
    });

    if (!event) {
      return NextResponse.json({
        success: false,
        payload: {
          remark: ApiResponseRemark.DOES_NOT_EXIST,
          subject: "event",
        },
      });
    }
  }

  // Check if attendance record already exists for this date and event
  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      classId: params.classId,
      ...(body.eventId ? { eventId: body.eventId } : {}),
    },
  });

  if (!existingAttendance) {
    return NextResponse.json({
      success: false,
      payload: {
        remark: ApiResponseRemark.DOES_NOT_EXIST,
        subject: "attendance record",
      },
    });
  }

  // Update existing attendance record
  const attendance = await prisma.attendance.update({
    where: {
      id: existingAttendance.id,
    },
    data: {
      present: {
        set: body.present.map(student => ({ id: student.id })),
      },
      late: {
        set: body.late.map(student => ({ id: student.id })),
      },
      absent: {
        set: body.absent.map(student => ({ id: student.id })),
      },
    },
    include: {
      event: {
        select: {
          id: true,
          name: true,
          startTime: true,
          endTime: true,
          location: true,
        },
      },
      present: {
        select: {
          id: true,
          username: true,
        },
      },
      late: {
        select: {
          id: true,
          username: true,
        },
      },
      absent: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    payload: {
      attendance,
    },
  });
}