export interface PotentialUserDTO {
  id: string;
  userId: string;
  role: string;
  company: string;
  experienceYear: number;
  isActive: boolean;
  keyUsed?: string;
  summary?: string;
  skills?: string[];
  projects?: any;
  education?: any;
  portfolioUrl?: string;
  resumeUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePotentialUserDTO {
  userId?: string;
  nim?: string;
  email?: string;
  role: string;
  company: string;
  experienceYear: number;
  keyUsed: string;
  summary?: string;
  skills?: string[];
  projects?: any;
  education?: any;
  portfolioUrl?: string;
  resumeUrl?: string;
}

export interface UpdatePotentialUserDTO {
  userId?: string;
  role?: string;
  company?: string;
  experienceYear?: number;
  isActive?: boolean;
  summary?: string;
  skills?: string[];
  projects?: any;
  education?: any;
  portfolioUrl?: string;
  resumeUrl?: string;
}
