// import { NextResponse } from 'next/server';
// import prisma from '@/lib/prisma';
// import { 
//   CreateInstitutionRequest, 
//   Institution,
//   UpdateInstitutionRequest
// } from '@/interfaces/api/Institution';
// import { ApiResponse, DefaultApiResponse, ErrorPayload } from '@/interfaces/api/Response';
// import { ApiResponseRemark } from '@/lib/ApiResponseRemark';

// /**
//  * GET /api/institutions
//  * Retrieves all institutions with their member counts
//  * 
//  * @returns {Promise<NextResponse<ApiResponse<Institution[]>>>} List of institutions
//  * 
//  * @security Requires authentication
//  */
// export async function GET(): Promise<NextResponse<ApiResponse<Institution[]>>> {
//   try {
//     const institutions = await prisma.institution.findMany({
//       include: {
//         _count: {
//           select: {
//             members: true
//           }
//         }
//       }
//     });

//     return NextResponse.json({ 
//       success: true, 
//       payload: institutions
//     });
//   } catch (error) {
//     return NextResponse.json(
//       { 
//         success: false,
//         payload: {
//           remark: ApiResponseRemark.INTERNAL_SERVER_ERROR
//         } as ErrorPayload
//       },
//       { status: 500 }
//     );
//   }
// }

// /**
//  * POST /api/institutions
//  * Creates a new institution
//  * 
//  * @param {Request} request - The incoming request object containing institution data
//  * @returns {Promise<NextResponse<ApiResponse<Institution>>>} Created institution data
//  * 
//  * @security Requires authentication
//  */
// export async function POST(request: Request): Promise<NextResponse<ApiResponse<Institution>>> {
//   try {
//     const body: CreateInstitutionRequest = await request.json();
//     const institution = await prisma.institution.create({
//       data: body
//     });

//     return NextResponse.json({
//       success: true,
//       payload: institution
//     });
//   } catch (error) {
//     return NextResponse.json({
//       success: false,
//       payload: {
//         remark: ApiResponseRemark.INTERNAL_SERVER_ERROR
//       } as ErrorPayload
//     }, { status: 500 });
//   }
// }

// /**
//  * PUT /api/institutions
//  * Updates an existing institution
//  * 
//  * @param {Request} request - The incoming request object containing updated institution data
//  * @returns {Promise<NextResponse<DefaultApiResponse>>} Success or error response
//  * 
//  * @security Requires authentication
//  */
// export async function PUT(request: Request): Promise<NextResponse<DefaultApiResponse>> {
//   try {
//     const body: UpdateInstitutionRequest = await request.json();
//     await prisma.institution.update({
//       where: { id: body.id },
//       data: body
//     });

//     return NextResponse.json({
//       success: true,
//       payload: {
//         remark: ApiResponseRemark.SUCCESS
//       }
//     });
//   } catch (error) {
//     return NextResponse.json({
//       success: false,
//       payload: {
//         remark: ApiResponseRemark.INTERNAL_SERVER_ERROR
//       }
//     }, { status: 500 });
//   }
// }

// // DELETE institution
// export async function DELETE(request: Request): Promise<NextResponse<ApiResponse<{ id: string }>>> {
//   try {
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get('id');

//     if (!id) {
//       return NextResponse.json(
//         {
//           success: false,
//           payload: {
//             remark: ApiResponseRemark.BAD_REQUEST,
//           }
//         },
//         { status: 400 }
//       );
//     }

//     await prisma.institution.delete({
//       where: {
//         id: id
//       }
//     });

//     return NextResponse.json({ 
//       success: true,
//       payload: { id }
//     });
//   } catch (error) {
//     return NextResponse.json(
//       { 
//         success: false,
//         payload: {
//           remark: ApiResponseRemark.INTERNAL_SERVER_ERROR,
//         }
//       },
//       { status: 500 }
//     );
//   }
// } 