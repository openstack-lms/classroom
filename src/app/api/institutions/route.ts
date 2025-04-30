import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { 
  CreateInstitutionRequest, 
  Institution,
  UpdateInstitutionRequest
} from '@/interfaces/api/Institution';
import { ApiResponse, DefaultApiResponse } from '@/interfaces/api/Response';
import { ApiResponseRemark } from '@/lib/ApiResponseRemark';

// GET all institutions
export async function GET(): Promise<NextResponse> {
  try {
    const institutions = await prisma.institution.findMany({
      include: {
        _count: {
          select: {
            members: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      payload: institutions
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        payload: {
          remark: 'Failed to fetch institutions'
        }
      },
      { status: 500 }
    );
  }
}

// POST new institution
export async function POST(request: Request): Promise<NextResponse<ApiResponse<{ institution: Institution}>>> {
  try {
    const body: CreateInstitutionRequest = await request.json();
    
    const institution: Institution = await prisma.institution.create({
      data: {
        name: body.name,
        code: body.code,
        address: body.address,
        city: body.city,
        state: body.state,
        country: body.country,
        postalCode: body.postalCode,
        phone: body.phone,
        email: body.email,
        website: body.website,
        description: body.description,
        establishedAt: body.establishedAt ? new Date(body.establishedAt) : null,
      },
    });

    return NextResponse.json({ 
      success: true,
      payload: {
        institution
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        payload: {
          remark: ApiResponseRemark.INTERNAL_SERVER_ERROR,
        }
      },
      { status: 500 }
    );
  }
}

// PUT (edit) institution
export async function PUT(request: Request): Promise<NextResponse<ApiResponse<Institution>>> {
  try {
    const body: UpdateInstitutionRequest = await request.json();
    
    const institution = await prisma.institution.update({
      where: {
        id: body.id
      },
      data: {
        name: body.name,
        code: body.code,
        address: body.address,
        city: body.city,
        state: body.state,
        country: body.country,
        postalCode: body.postalCode,
        phone: body.phone,
        email: body.email,
        website: body.website,
        description: body.description,
        establishedAt: body.establishedAt ? new Date(body.establishedAt) : undefined,
      },
    });

    return NextResponse.json({ 
      success: true,
      payload: institution
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        payload: {
          remark: ApiResponseRemark.INTERNAL_SERVER_ERROR,
        }
      },
      { status: 500 }
    );
  }
}

// DELETE institution
export async function DELETE(request: Request): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          payload: {
            remark: ApiResponseRemark.BAD_REQUEST,
          }
        },
        { status: 400 }
      );
    }

    await prisma.institution.delete({
      where: {
        id: id
      }
    });

    return NextResponse.json({ 
      success: true,
      payload: { id }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        payload: {
          remark: ApiResponseRemark.INTERNAL_SERVER_ERROR,
        }
      },
      { status: 500 }
    );
  }
} 