// src/services/service.service.js
import prisma from '../models/db.js'
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js'

export async function getAllServices () {
  return prisma.service.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' }
  })
}

export async function getServiceById (id) {
  const service = await prisma.service.findUnique({ where: { id } })

  if (!service || !service.isActive) {
    const error = new Error('Servicio no encontrado')
    error.statusCode = 404
    throw error
  }

  return service
}

export async function createService (data, file) {
  // Por diseño: cada servicio debe tener una imagen asociada
  if (!file) {
    const error = new Error('La imagen del servicio es obligatoria')
    error.statusCode = 400
    throw error
  }

  const uploadResult = await uploadBufferToCloudinary(file.buffer, {
    folder: 'veterinaria/services'
  })

  const imageUrl = uploadResult.secure_url
  const imagePublicId = uploadResult.public_id

  // Campos esperados en data:
  // name, description?, type, durationMin?, price
  // type: 'GROOMING' | 'CONSULTATION' | 'VACCINE'

  return prisma.service.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      type: data.type, // Validar antes en capa superior si quieres
      durationMin: data.durationMin ? parseInt(data.durationMin) : null,
      price: data.price ? parseFloat(data.price) : 0,
      imageUrl,
      imagePublicId
    }
  })
}

export async function updateService (id, data, file) {
  const existing = await prisma.service.findUnique({ where: { id } })

  if (!existing) {
    const error = new Error('Servicio no encontrado')
    error.statusCode = 404
    throw error
  }

  let imageUrl = existing.imageUrl
  let imagePublicId = existing.imagePublicId

  if (file) {
    // Borrar imagen anterior si existía
    if (imagePublicId) {
      await deleteFromCloudinary(imagePublicId)
    }

    const uploadResult = await uploadBufferToCloudinary(file.buffer, {
      folder: 'veterinaria/services'
    })

    imageUrl = uploadResult.secure_url
    imagePublicId = uploadResult.public_id
  }

  return prisma.service.update({
    where: { id },
    data: {
      name: data.name ?? existing.name,
      description: data.description ?? existing.description,
      type: data.type ?? existing.type,
      durationMin: data.durationMin
        ? parseInt(data.durationMin)
        : existing.durationMin,
      price: data.price
        ? parseFloat(data.price)
        : existing.price,
      imageUrl,
      imagePublicId,
      isActive: typeof data.isActive === 'boolean'
        ? data.isActive
        : existing.isActive
    }
  })
}

export async function deleteService (id) {
  const existing = await prisma.service.findUnique({ where: { id } })

  if (!existing) {
    const error = new Error('Servicio no encontrado')
    error.statusCode = 404
    throw error
  }

  if (existing.imagePublicId) {
    await deleteFromCloudinary(existing.imagePublicId)
  }

  await prisma.service.delete({ where: { id } })
}
