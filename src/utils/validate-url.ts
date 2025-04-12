export function isValidYouTubeUrl(url: string): boolean {
  const pattern =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]{11}(&.*)?$/;
  return pattern.test(url);
}
