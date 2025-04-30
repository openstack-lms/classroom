// Basic Institution type matching Prisma schema
export interface Institution {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  establishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  members?: User[]; // Optional because we might not always include relations
}

// User interface for the relation (simplified)
export interface User {
  id: string;
  username: string;
  institutionId: string | null;
}

// Create Institution Request (omits auto-generated fields)
export interface CreateInstitutionRequest {
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  establishedAt?: string | null; // String for JSON transport, converted to Date in backend
}

// Update Institution Request
export interface UpdateInstitutionRequest extends Partial<CreateInstitutionRequest> {
  id: string;
}