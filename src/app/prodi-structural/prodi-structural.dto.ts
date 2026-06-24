export interface ProdiStructuralDTO {
  id: string;
  name: string;
  role: string;
  image?: string;
  bio?: string;
  sequence: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProdiStructuralDTO {
  name: string;
  role: string;
  image?: string;
  bio?: string;
  sequence: number;
  isActive?: boolean;
}

export interface UpdateProdiStructuralDTO {
  name?: string;
  role?: string;
  image?: string;
  bio?: string;
  sequence?: number;
  isActive?: boolean;
}
