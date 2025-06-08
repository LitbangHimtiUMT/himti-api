import { Query } from "../../interface/Query";
import { prisma } from "../../config";
import { UpdateEventMeetingRequest } from "./event-meeting.dto";

export const getEventMeetingById = async (eventMeetingId: string) => {
  return await prisma.eventMeeting.findUnique({
    where: {
      id: eventMeetingId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      Meeting: {
        select: {
          id: true,
          name: true,
          description: true,
          startTime: true,
          endTime: true,
          class: {
            select: {
              id: true,
              name: true,
            }
          }
        },
      },
    },
  });
};

export const createEventMeeting = async (
  name: string,
  description?: string
) => {
  return await prisma.eventMeeting.create({
    data: {
      name,
      description,
    },
    select: {
      id: true,
    },
  });
};

export const getEventMeetingByName = async (name: string) => {
  return await prisma.eventMeeting.findFirst({
    where: {
      name,
    },
  });
};

export const getEventMeetings = async (query: Query, userId?: string) => {
  const { page = "1", perPage = "10", search = "" } = query;
  return await prisma.eventMeeting.findMany({
    where: {
      name: {
        contains: search,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      Meeting: {
        where: {
          OR: [
            // Selalu tampilkan meeting tanpa classId
            { classId: null },
            // Untuk meeting dengan classId, tampilkan hanya jika user adalah peserta
            {
              classId: { not: null },
              class: {
                classParticipant: {
                  some: {
                    userId,
                  },
                },
              },
            },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          description: true,
          startTime: true,
          endTime: true,
          createdAt: true,
          Attendance: {
            select: {
              userId: true,
            },
          },
          class: {
            select: {
              id: true,
              name: true,
            }
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: Number(perPage),
    skip: (Number(page) - 1) * Number(perPage),
  });
};
export const getEventMeetingsCount = async (query: Query) => {
  const { search = "" } = query;
  return await prisma.eventMeeting.count({
    where: {
      name: {
        contains: search,
        mode: "insensitive",
      },
    },
  });
};

export const updateEventMeeting = async (data: UpdateEventMeetingRequest) => {
  return await prisma.eventMeeting.update({
    where: {
      id: data.eventMeetingId,
    },
    data,
  });
};

export const deleteEventMeeting = async (eventMeetingId: string) => {
  return await prisma.eventMeeting.delete({
    where: {
      id: eventMeetingId,
    },
  });
};
