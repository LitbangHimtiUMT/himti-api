export interface ContactInfoDTO {
  id: string;
  key: string;
  value: string;
  group: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContactInfoDTO {
  key: string;
  value: string;
  group: string;
}

export interface UpdateContactInfoDTO {
  value?: string;
  group?: string;
}
