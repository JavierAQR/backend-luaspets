// src/services/pet.service.js
import prisma from '../models/db.js'
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js'

function notFoundError (message = 'Mascota no encontrada') {
  const error = new Error(message)
  error.statusCode = 404
  return error
}

function forbiddenError (message = 'No tienes permiso para acceder a esta mascota') {
  const error = new Error(message)
  error.statusCode = 403
  return error
}

// Solo mascotas del usuario (para GET /pets)
export async function getMyPets (userId) {
  return prisma.pet.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' }
  })
}

// Pet por id, validando propietario (o ADMIN)
export async function getPetById (user, petId) {
  const pet = await prisma.pet.findUnique({ where: { id: petId } })
  if (!pet) throw notFoundError()

  if (user.role !== 'ADMIN' && pet.ownerId !== user.id) {
    throw forbiddenError()
  }

  return pet
}

// Crea mascota para el usuario logueado
export async function createPet (userId, data, file) {
  let imageUrl = null
  let imagePublicId = null

  if (file) {
    const uploadResult = await uploadBufferToCloudinary(file.buffer, {
      folder: 'veterinaria/pets'
    })
    imageUrl = uploadResult.secure_url
    imagePublicId = uploadResult.public_id
  }

  // Campos esperados en data:
  // name (required), species, breed?, sex?, birthDate?, weightKg?, notes?
  // sex: 'MALE' | 'FEMALE' | 'OTHER'

  return prisma.pet.create({
    data: {
      name: data.name,
      species: data.species ?? 'Desconocido',
      breed: data.breed ?? null,
      sex: data.sex ?? null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      weightKg: data.weightKg ? parseFloat(data.weightKg) : null,
      notes: data.notes ?? null,
      imageUrl,
      imagePublicId,
      owner: {
        connect: { id: userId }
      }
    }
  })
}

// Actualiza mascota (solo dueño o ADMIN)
export async function updatePet (user, petId, data, file) {
  const existing = await prisma.pet.findUnique({ where: { id: petId } })
  if (!existing) throw notFoundError()

  if (user.role !== 'ADMIN' && existing.ownerId !== user.id) {
    throw forbiddenError()
  }

  let imageUrl = existing.imageUrl
  let imagePublicId = existing.imagePublicId

  if (file) {
    if (imagePublicId) {
      await deleteFromCloudinary(imagePublicId)
    }

    const uploadResult = await uploadBufferToCloudinary(file.buffer, {
      folder: 'veterinaria/pets'
    })
    imageUrl = uploadResult.secure_url
    imagePublicId = uploadResult.public_id
  }

  return prisma.pet.update({
    where: { id: petId },
    data: {
      name: data.name ?? existing.name,
      species: data.species ?? existing.species,
      breed: data.breed ?? existing.breed,
      sex: data.sex ?? existing.sex,
      birthDate: data.birthDate
        ? new Date(data.birthDate)
        : existing.birthDate,
      weightKg: data.weightKg
        ? parseFloat(data.weightKg)
        : existing.weightKg,
      notes: data.notes ?? existing.notes,
      imageUrl,
      imagePublicId
    }
  })
}

// Borra mascota (solo dueño o ADMIN)
export async function deletePet (user, petId) {
  const existing = await prisma.pet.findUnique({ where: { id: petId } })
  if (!existing) throw notFoundError()

  if (user.role !== 'ADMIN' && existing.ownerId !== user.id) {
    throw forbiddenError()
  }

  if (existing.imagePublicId) {
    await deleteFromCloudinary(existing.imagePublicId)
  }

  await prisma.pet.delete({ where: { id: petId } })
}
