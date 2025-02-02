export interface CreateModuleBodyRequest {
  name: string;
  sessionId: string;
  textModule?: string;
  videoUrl?: string;
  fileModule?: string;
}
