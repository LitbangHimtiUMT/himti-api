import { Jabatan } from "@prisma/client";

export interface IFilterStructural {
  search?: string;
  page?: number;
  perPage?: number;
  angkatan?: string;
  jabatan?: Jabatan;
}
