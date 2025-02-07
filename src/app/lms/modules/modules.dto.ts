export interface CreateModuleBodyRequest {
  name: string;
  sessionId: string;
  textModule?: string;
  videoUrl?: string;
  fileModule?: string;
}

export interface ModulesDTO {
  id: string;
  name: string;
  textModule: string | null;
  videoUrl: string | null;
  fileModule: string | null;
  youtubeId: string | null;
  thumbnailUrl: string | null;
}
