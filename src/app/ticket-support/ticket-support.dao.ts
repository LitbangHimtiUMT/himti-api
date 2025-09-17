export interface TicketSupportCreation {
    title: string
    description: string
    file: Express.Multer.File
}

export interface TicketSupportCreationRepository extends Omit<TicketSupportCreation, 'file'> {
    file: string
}