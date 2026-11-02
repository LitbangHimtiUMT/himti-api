export interface PeriodeDTO {
  id: string;
  name?: string;
  period: string;
  logo?: string;
  vision: string;
  mission: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePeriodeDTO {
  name?: string;
  period: string;
  logo?: string;
  vision: string;
  mission: any; // Will be parsed to JSON
  isActive?: boolean;
}

export interface UpdatePeriodeDTO {
  name?: string;
  period?: string;
  logo?: string;
  vision?: string;
  mission?: any;
  isActive?: boolean;
}
