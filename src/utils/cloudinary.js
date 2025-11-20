import cloudinary from '../config/cloudinary.js'
import streamifier from 'streamifier'

export function uploadBufferToCloudinary (buffer, {
  folder = 'veterinaria/general',
  publicId = undefined,
  overwrite = true,
  resourceType = 'image'
} = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, overwrite, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )
    streamifier.createReadStream(buffer).pipe(uploadStream)
  })
}

export async function deleteFromCloudinary (publicId, {
  resourceType = 'image',
  invalidate = true
} = {}) {
  if (!publicId) return null
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate
  })
}
