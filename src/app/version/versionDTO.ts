export interface VersionBodyRequest {
  id: number;
  androidVersion?: string;
  iosVersion?: string;
  playstoreLink?: string;
  appStoreLink?: string;
  notes?: string;
}
