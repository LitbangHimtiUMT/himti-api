export interface PotentialUserDTO {
  id: string;
  userId: string;
  role: string;
  company: string;
  experienceYear: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePotentialUserDTO {
  userId: string;
  role: string;
  company: string;
  experienceYear: number;
}

export interface UpdatePotentialUserDTO {
  userId?: string;
  role?: string;
  company?: string;
  experienceYear?: number;
  isActive?: boolean;
}
