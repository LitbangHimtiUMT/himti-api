import { Assignment, CompletedModule, Module } from "@prisma/client";
import {
  BUCKET_FOLDER,
  GetPublicURL,
} from "../../../utils/upload-file-to-storage";
import { youtubeID } from "../../../utils/youtbe-url";
import { ModulesDTO } from "./modules.dto";

export interface ModuleData extends Module {
  assignment: Assignment | null;
  completedModule: CompletedModule[];
  _count?: {
    completedModule?: number;
  };
}

export const getModulesMapper = (data: ModuleData[]): ModulesDTO[] => {
  return data.map((item) => ({
    id: item.id,
    name: item.name,
    file: {
      fileName: item.fileModule,
      url: item.fileModule
        ? GetPublicURL(`${BUCKET_FOLDER.modules}/${item.fileModule}`)
        : null,
    },
    textModule: item.textModule,
    videoUrl: item.videoUrl,
    youtubeId: item.videoUrl ? youtubeID(item.videoUrl) : null,
    thumbnailUrl: item.videoUrl
      ? `https://i.ytimg.com/vi/${youtubeID(item.videoUrl)}/hqdefault.jpg`
      : null,
    assignment: item.assignment
      ? {
          id: item.assignment?.id,
          title: item.assignment?.title,
          isFinalAssigment: item.assignment?.isFinalAssigment,
          dueDate: item.assignment?.dueDate,
        }
      : null,
    isCompleted: !!item.completedModule?.length,
  }));

  // Get the minimum session index from the modules we're mapping
  // const minSessionIndex = Math.min(...data.map((module, index) => index));
};
// : Promise<ModulesDTO[]>
// export const getModulesMapper = async (
//   data: ModuleData[],
//   userId: string // Add userId parameter to check completed modules
// ) => {
//   // Get all sessions with their modules and completion status
//   const allSessions = await prisma.session.findMany({
//     select: {
//       id: true,
//       module: {
//         select: {
//           id: true,
//           completedModule: {
//             where: { userId },
//             select: { userId: true }
//           },
//           createdAt: true
//         },
//         orderBy: { createdAt: "asc" }
//       }
//     },
//     orderBy: { createdAt: "asc" }
//   });

//   // Create a map of session IDs to their index and modules
//   const sessionMap = allSessions.map((session, sessionIndex) => ({
//     ...session,
//     index: sessionIndex,
//     modules: session.module.map(module => ({
//       ...module,
//       isCompleted: module.completedModule.length > 0
//     }))
//   }));

//   return data.map((item) => {
//     // Find the current session in our map
//     const currentSession = sessionMap.find(s => s.id === item.sessionId);
//     if (!currentSession) return { ...item, isLocked: true }; // If session not found, lock module

//     // Find all previous sessions (with lower index)
//     const previousSessions = sessionMap.filter(s => s.index < currentSession.index);

//     // Check if all modules in previous sessions are completed
//     const allPreviousSessionsCompleted = previousSessions.every(session =>
//       session.modules.every(module => module.isCompleted)
//     );

//     // Find all previous modules in current session (created before this one)
//     const previousModulesInSession = currentSession.modules.filter(m =>
//       m.createdAt < item.createdAt
//     );

//     // Check if all previous modules in current session are completed
//     const allPreviousModulesCompleted = previousModulesInSession.every(m => m.isCompleted);

//     // Module is locked if:
//     // 1. Not all previous sessions are completed OR
//     // 2. Not all previous modules in current session are completed
//     const isLocked = !allPreviousSessionsCompleted || !allPreviousModulesCompleted;

//     return {
//       id: item.id,
//       name: item.name,
//       file: {
//         fileName: item.fileModule,
//         url: item.fileModule
//           ? GetPublicURL(`${BUCKET_FOLDER.modules}/${item.fileModule}`)
//           : null,
//       },
//       textModule: item.textModule,
//       videoUrl: item.videoUrl,
//       youtubeId: item.videoUrl ? youtubeID(item.videoUrl) : null,
//       thumbnailUrl: item.videoUrl
//         ? `https://i.ytimg.com/vi/${youtubeID(item.videoUrl)}/hqdefault.jpg`
//         : null,
//       assignment: item.assignment
//         ? {
//             id: item.assignment?.id,
//             title: item.assignment?.title,
//             isFinalAssigment: item.assignment?.isFinalAssigment,
//             dueDate: item.assignment?.dueDate,
//           }
//         : null,
//       isLocked,
//       isCompleted: item.completedModule?.length > 0 || false
//     };
//   });
// };

export const getModuleMapper = (data: ModuleData): ModulesDTO => {
  return {
    id: data.id,
    name: data.name,
    file: {
      fileName: data.fileModule,
      url: data.fileModule
        ? GetPublicURL(`${BUCKET_FOLDER.modules}/${data.fileModule}`)
        : null,
    },
    textModule: data.textModule,
    videoUrl: data.videoUrl,
    youtubeId: data.videoUrl ? youtubeID(data.videoUrl) : null,
    thumbnailUrl: data.videoUrl
      ? `https://i.ytimg.com/vi/${youtubeID(data.videoUrl)}/hqdefault.jpg`
      : null,
    assignment: data.assignment
      ? {
          id: data.assignment?.id,
          title: data.assignment?.title,
          isFinalAssigment: data.assignment?.isFinalAssigment,
          dueDate: data.assignment?.dueDate,
        }
      : null,
  };
};
