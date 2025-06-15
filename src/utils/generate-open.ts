
export const generateOpen = (startTime: Date, endTime: Date): boolean => {

  const now = new Date()
  const isExpiredEnd = new Date(endTime as Date) < new Date(now)
  const isExpiredStart = new Date(startTime as Date) < new Date(now)

  const open = isExpiredStart && !isExpiredEnd
  return open
}

export const generateSingleOpenByStartTime = (startTime: Date) => {
  const open = new Date(startTime as Date) > new Date(Date.now())
  return open
}

export const generateSingleOpenByEndTime = (endTime: Date) => {
  const open = new Date(endTime as Date) < new Date(Date.now())
  return open
}

export const checkDueDate = (dueDate: Date): boolean => {
  const now = new Date();
  const due = new Date(dueDate);
  
  // Set due date ke akhir hari (23:59:59.999)
  due.setHours(23, 59, 59, 999);
  
  return now <= due;
}