// src/services/cart.service.js
import prisma from '../models/db.js'

function notFoundError (message = 'Recurso no encontrado') {
  const error = new Error(message)
  error.statusCode = 404
  return error
}

function forbiddenError (message = 'No tienes permiso para realizar esta acción') {
  const error = new Error(message)
  error.statusCode = 403
  return error
}

function badRequestError (message = 'Solicitud inválida') {
  const error = new Error(message)
  error.statusCode = 400
  return error
}

// ---------- HELPERS ----------

async function getOrCreateActiveCart (userId) {
  let cart = await prisma.cart.findFirst({
    where: { userId, isActive: true },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  })

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        user: { connect: { id: userId } },
        isActive: true
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })
  }

  return cart
}

async function getActiveCartOrNull (userId) {
  return prisma.cart.findFirst({
    where: { userId, isActive: true },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  })
}

// Devuelve el carrito ya populado
async function getCartWithItems (cartId) {
  return prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  })
}

// ---------- PÚBLICOS ----------

// GET /cart
export async function getMyCart (userId) {
  return getOrCreateActiveCart(userId)
}

// POST /cart/items
export async function addItemToCart (userId, { productId, quantity }) {
  if (!productId) {
    throw badRequestError('productId es obligatorio')
  }

  const qty = parseInt(quantity ?? '1', 10)
  if (Number.isNaN(qty) || qty <= 0) {
    throw badRequestError('La cantidad debe ser un número mayor a 0')
  }

  // Verificar producto
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product || !product.isActive) {
    throw notFoundError('Producto no encontrado o no disponible')
  }

  const cart = await getOrCreateActiveCart(userId)

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId
    }
  })

  // (Opcional) validar stock
  if (product.stock !== null && product.stock !== undefined) {
    const currentQty = existingItem ? existingItem.quantity : 0
    if (currentQty + qty > product.stock) {
      throw badRequestError('No hay stock suficiente para este producto')
    }
  }

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + qty,
        // en general mantienes el unitPrice original, pero podrías actualizarlo
        unitPrice: existingItem.unitPrice
      }
    })
  } else {
    await prisma.cartItem.create({
      data: {
        cart: { connect: { id: cart.id } },
        product: { connect: { id: productId } },
        quantity: qty,
        unitPrice: product.price
      }
    })
  }

  return getCartWithItems(cart.id)
}

// PUT /cart/items/:itemId
export async function updateCartItem (userId, itemId, quantity) {
  const qty = parseInt(quantity, 10)
  if (Number.isNaN(qty)) {
    throw badRequestError('La cantidad debe ser un número')
  }

  // Si mandan 0 o menos, interpretamos como eliminar el item
  if (qty <= 0) {
    return removeCartItem(userId, itemId)
  }

  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: {
      cart: true,
      product: true
    }
  })

  if (!item) throw notFoundError('Item de carrito no encontrado')
  if (item.cart.userId !== userId) {
    throw forbiddenError('El item no pertenece a tu carrito')
  }

  // (Opcional) validar stock
  if (item.product.stock !== null && item.product.stock !== undefined) {
    if (qty > item.product.stock) {
      throw badRequestError('No hay stock suficiente para este producto')
    }
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: {
      quantity: qty
    }
  })

  return getCartWithItems(item.cartId)
}

// DELETE /cart/items/:itemId
export async function removeCartItem (userId, itemId) {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: {
      cart: true
    }
  })

  if (!item) throw notFoundError('Item de carrito no encontrado')
  if (item.cart.userId !== userId) {
    throw forbiddenError('El item no pertenece a tu carrito')
  }

  const cartId = item.cartId

  await prisma.cartItem.delete({
    where: { id: itemId }
  })

  return getCartWithItems(cartId)
}

// DELETE /cart
export async function clearCart (userId) {
  const cart = await getActiveCartOrNull(userId)
  if (!cart) {
    // Si no hay carrito, creamos uno vacío para mantener respuesta consistente
    return getOrCreateActiveCart(userId)
  }

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id }
  })

  return getCartWithItems(cart.id)
}
