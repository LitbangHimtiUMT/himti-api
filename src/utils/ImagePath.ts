import { environment } from "../libs"

export const ImagePath = (filename:string) => {
  const endpoint = environment.STORAGE.ENDPOINT_RESPONSE
  const bucket = environment.STORAGE.BUCKET
  const folder = environment.STORAGE.BUCKET_FOLDER

  return `${endpoint}/${bucket}/${folder}/${filename}`
}