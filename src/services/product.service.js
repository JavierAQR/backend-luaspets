import prisma from '../models/db.js'
import {
  uploadBufferToCloudinary,
  deleteFromCloudinary
} from '../utils/cloudinary.js'

export async function getAllProducts () {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getProductById (id) {
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product || !product.isActive) {
    const error = new Error('Producto no encontrado')
    error.statusCode = 404
    throw error
  }
  return product
}

export async function createProduct (data, file) {
  let imageUrl, imagePublicId

  if (file) {
    const uploadResult = await uploadBufferToCloudinary(file.buffer, {
      folder: 'veterinaria/products'
    })
    imageUrl = uploadResult.secure_url
    imagePublicId = uploadResult.public_id
  }

  return prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      category: data.category, // 'ACCESSORY' | 'FOOD' | 'TOY'
      price: parseFloat(data.price),
      stock: parseInt(data.stock ?? '0'),
      imageUrl,
      imagePublicId
    }
  })
}

export async function updateProduct (id, data, file) {
  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing) {
    const error = new Error('Producto no encontrado')
    error.statusCode = 404
    throw error
  }

  let imageUrl = existing.imageUrl
  let imagePublicId = existing.imagePublicId

  if (file) {
    // borra la anterior si existía
    if (imagePublicId) {
      await deleteFromCloudinary(imagePublicId)
    }
    const uploadResult = await uploadBufferToCloudinary(file.buffer, {
      folder: 'veterinaria/products'
    })
    imageUrl = uploadResult.secure_url
    imagePublicId = uploadResult.public_id
  }

  return prisma.product.update({
    where: { id },
    data: {
      name: data.name ?? existing.name,
      description: data.description ?? existing.description,
      category: data.category ?? existing.category,
      price: data.price ? parseFloat(data.price) : existing.price,
      stock: data.stock ? parseInt(data.stock) : existing.stock,
      imageUrl,
      imagePublicId,
      isActive:
        data.isActive !== undefined
          ? data.isActive === 'true'
          : existing.isActive
    }
  })
}

export async function deleteProduct (id) {
  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing) return

  if (existing.imagePublicId) {
    await deleteFromCloudinary(existing.imagePublicId)
  }

  await prisma.product.delete({ where: { id } })
}
