export interface BusinessDTO {
  title: string;
  description: string;
  contactPerson: string;
  url?: string;
  startPrice: number;
  endPrice: number;
}

export interface UploadFileBussinessDTO {
  image: Express.Multer.File;
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
