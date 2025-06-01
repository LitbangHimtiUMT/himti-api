export const convertQueryParamsToObject = <T = Record<string, string>>(
  queryParams: string
): T => {
  const query = new URLSearchParams(queryParams);
  const object: Record<string, string> = {};
  for (const [key, value] of query) {
    object[key] = value;
  }
  return object as T;
};

// export const youtubeID = (url: string) => {
//   const regex = /(?<=v=)[^&#]{11}/;
//   const match = url.match(regex);
//   return match ? match[0] : null;
// };

export const youtubeID = (url: string): string | null => {
  // Untuk format: https://youtu.be/VIDEO_ID
  if (url.includes("youtu.be/")) {
    return url.split("/").pop()?.split("?")?.[0] ?? null;
  }
  // Untuk format: https://www.youtube.com/watch?v=VIDEO_ID
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : null;
}
