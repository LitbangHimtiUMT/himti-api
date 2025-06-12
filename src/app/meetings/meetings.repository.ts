import { Query } from "../../interface/Query";
import { prisma } from "../../config";
import {
  FilterMeeting,
  UpdateMeetingBodyRequest,
  type CreateMeetingBodyRequest,
} from "./meetings.dto";

export const getMeetingById = async (meetingId: string) => {
  return await prisma.meeting.findUnique({
    where: {
      id: meetingId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      startTime: true,
      endTime: true,
      resume: true,
      eventMeetingId: true,
      Attendance: {
        select: {
          id: true,
          userId: true,
        },
      },
      class: {
        select: {
          id: true,
          name: true,
        },
      },
      EventMeeting: true,
    },
  });
};

export const createMeeting = async ({
  name,
  description,
  startTime,
  endTime,
  eventMeetingId,
  classId,
}: CreateMeetingBodyRequest) => {
  return await prisma.meeting.create({
    data: {
      name,
      description,
      startTime,
      endTime,
      eventMeetingId,
      classId,
    },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });
};

export const getMeetingByEventMeetingId = async (
  eventMeetingId: string,
  name: string
) => {
  return await prisma.meeting.findFirst({
    where: {
      eventMeetingId,
      name,
    },
  });
};

export const getMeetingsByEventMeetingId = async (query: FilterMeeting) => {
  const { page = "1", perPage = "10", eventMeetingId } = query;
  return await prisma.meeting.findMany({
    where: {
      eventMeetingId,
    },
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
        },
      },
      EventMeeting: {
        select: {
          id: true,
          name: true,
        },
      },
      Attendance: {
        select: {
          User: {
            select: {
              id: true,
              name: true,
            },
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

export const getMeetingsByEventMeetingIdCount = async (
  query: FilterMeeting
) => {
  const { eventMeetingId } = query;
  return await prisma.meeting.count({
    where: {
      eventMeetingId,
    },
  });
};

export const getMeetings = async (query: Query) => {
  const { page = "1", perPage = "10", search, eventMeetingId } = query;
  return await prisma.meeting.findMany({
    where: {
      eventMeetingId,
      EventMeeting: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      name: {
        contains: search,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      startTime: true,
      endTime: true,
      eventMeetingId: true,
      EventMeeting: {
        select: {
          id: true,
          name: true,
        },
      },
      Attendance: {
        select: {
          User: {
            select: {
              id: true,
              name: true,
            },
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

export const getMeetingsCount = async (query: Query) => {
  const { search, eventMeetingId } = query;
  return await prisma.meeting.count({
    where: {
      eventMeetingId,

      EventMeeting: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      name: {
        contains: search,
        mode: "insensitive",
      },
    },
  });
};

export const updateMeeting = async (data: UpdateMeetingBodyRequest) => {
  return await prisma.meeting.update({
    where: {
      id: data.meetingId,
    },
    data: {
      name: data.name,
      classId: data.classId,
      description: data.description,
      startTime: data.startTime,
      endTime: data.endTime,
    },
  });
};

export const deleteMeetingManyByEventMeetingId = async (
  eventMeetingId: string
) => {
  return await prisma.meeting.deleteMany({
    where: {
      eventMeetingId,
    },
  });
};

export const deleteMeeting = async (meetingId: string) => {
  return await prisma.meeting.delete({
    where: {
      id: meetingId,
    },
  });
};

export const getMeetingToday = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  return await prisma.meeting.findFirst({
    where: {
      startTime: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      EventMeeting: true,
    },
  });
};
