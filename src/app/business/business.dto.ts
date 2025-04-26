export interface BusinessDTO {
  title: string;
  description: string;
  contactPerson: string;
  url?: string;
  image?: Express.Multer.File[];
  startPrice: string;
  endPrice: string;
}

export interface ImageProps {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  path: string;
  size: number;
  filename: string;
}

export interface IFilterBusiness {
  search?: string;
  page?: number;
  perPage?: number;
}
