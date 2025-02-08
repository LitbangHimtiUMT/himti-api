export interface Query {
  page?: string;
  perPage?: string;
  search?: string;
  isOpen?: string;
  eventMeetingId?: string;
  status?: string;
  transactionType?: string;
  classId?: string;
  sessionId?: string;
  authType?: 'lms' | 'app'
}
