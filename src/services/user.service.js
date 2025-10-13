import cloudinary from '../config/cloudinary.js'
import streamifier from 'streamifier'
import prisma from '../models/db.js'

export const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      lastname: true,
      email: true,
      phoneNumber: true,
      address: true,
      profileImage: true,
      createdAt: true
    }
  })
  return user
}

async function uploadToCloudinary (buffer, folder = 'veterinaria/users', publicId = undefined) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        overwrite: true,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )
    streamifier.createReadStream(buffer).pipe(uploadStream)
  })
}

export const updateProfile = async (userId, data = {}, file) => {
  const { name, lastname, phoneNumber, address, removeImage } = data

  // 1. Buscar usuario actual
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('Usuario no encontrado')

  // 2. Si phoneNumber cambió, validar unicidad
  if (phoneNumber && phoneNumber !== user.phoneNumber) {
    const existing = await prisma.user.findUnique({ where: { phoneNumber } })
    if (existing) throw new Error('El número de teléfono ya está en uso')
  }

  // 3. Manejo de imagen: si viene file -> subir a cloudinary y borrar anterior
  let profileImage = user.profileImage
  let profileImagePublicId = user.profileImagePublicId

  if (file && file.buffer) {
    // Generar public_id nuevo (por ejemplo user_<id>_<timestamp>)
    const timestamp = Date.now()
    const newPublicId = `user_${userId}_${timestamp}`

    // Subir
    const uploadResult = await uploadToCloudinary(file.buffer, 'veterinaria/users', newPublicId)
    // uploadResult contiene secure_url y public_id
    profileImage = uploadResult.secure_url
    profileImagePublicId = uploadResult.public_id

    // borrar imagen anterior si existía y no es la misma public_id (por seguridad)
    if (user.profileImagePublicId && user.profileImagePublicId !== profileImagePublicId) {
      try {
        await cloudinary.uploader.destroy(user.profileImagePublicId)
      } catch (e) {
        console.warn('No se pudo eliminar la imagen anterior en Cloudinary', e)
      }
    }
  } else if (removeImage) {
    // Si solicita borrar la imagen
    if (user.profileImagePublicId) {
      try {
        await cloudinary.uploader.destroy(user.profileImagePublicId)
      } catch (e) {
        console.warn('No se pudo eliminar la imagen anterior en Cloudinary', e)
      }
    }
    profileImage = null
    profileImagePublicId = null
  }

  // 4. Actualizar campos en DB
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      name: name ?? user.name,
      lastname: lastname ?? user.lastname,
      phoneNumber: phoneNumber ?? user.phoneNumber,
      address: address ?? user.address,
      profileImage,
      profileImagePublicId
    }
    // Excluir password en selección al devolver
  })

  // 5. Retornar usuario (puedes hacer select para evitar password)
  const publicUser = await prisma.user.findUnique({
    where: { id: updated.id },
    select: {
      id: true,
      name: true,
      lastname: true,
      phoneNumber: true,
      email: true,
      address: true,
      profileImage: true,
      profileImagePublicId: true,
      role: true,
      createdAt: true
    }
  })

  return publicUser
}
