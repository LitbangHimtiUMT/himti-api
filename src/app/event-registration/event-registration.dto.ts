export interface EventRegistrationCreationDTO {
  eventId: string;
  userId: string;
  image?: Express.Multer.File;
  material?: string;
  class: string;
  name: string;
}
