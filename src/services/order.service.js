import prisma from '../models/db.js'

function generateOrderNumber () {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `ORD-${timestamp}-${random}`
}

export async function createOrderFromCart (userId, shippingInfo) {
  // Obtener carrito activo
  const cart = await prisma.cart.findFirst({
    where: { userId, isActive: true },
    include: {
      items: {
        include: { product: true }
      }
    }
  })

  if (!cart || cart.items.length === 0) {
    const error = new Error('El carrito está vacío')
    error.statusCode = 400
    throw error
  }

  // Calcular total
  const total = cart.items.reduce((sum, item) => {
    return sum + (Number(item.unitPrice) * item.quantity)
  }, 0)

  // Crear orden
  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId,
      shippingName: shippingInfo.fullName,
      shippingEmail: shippingInfo.email,
      shippingPhone: shippingInfo.phone,
      shippingAddress: shippingInfo.address,
      shippingCity: shippingInfo.city,
      shippingNotes: shippingInfo.notes || null,
      total,
      items: {
        create: cart.items.map(item => ({
          productName: item.product.name,
          productImage: item.product.imageUrl,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      }
    },
    include: {
      items: true
    }
  })

  // Vaciar carrito
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id }
  })

  return order
}

export async function getMyOrders (userId) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getOrderById (userId, orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true
    }
  })

  if (!order) {
    const error = new Error('Orden no encontrada')
    error.statusCode = 404
    throw error
  }

  if (order.userId !== userId) {
    const error = new Error('No tienes permiso para ver esta orden')
    error.statusCode = 403
    throw error
  }

  return order
}

export async function completeOrder (userId, orderId, paypalOrderId) {
  return await prisma.$transaction(async (tx) => {
    // 1. Obtener orden con items
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: true
      }
    })

    if (!order) {
      const error = new Error('Orden no encontrada')
      error.statusCode = 404
      throw error
    }

    if (order.userId !== userId) {
      const error = new Error('No autorizado')
      error.statusCode = 403
      throw error
    }

    if (order.status === 'COMPLETED') {
      // evitar doble descuento de stock
      return order
    }

    // 2. Restar stock de cada producto comprado
    for (const item of order.items) {
      // buscar producto por nombre o relacionarlo mejor si tienes productId
      const product = await tx.product.findFirst({
        where: { name: item.productName }
      })

      if (!product) {
        throw new Error(`Producto no encontrado: ${item.productName}`)
      }

      const newStock = product.stock - item.quantity

      if (newStock < 0) {
        throw new Error(
            `Stock insuficiente para: ${item.productName}. Disponible: ${product.stock}`
        )
      }

      // actualizar stock
      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: newStock
        }
      })
    }

    // 3. Actualizar orden como completada
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETED',
        paypalOrderId
      }
    })

    return updatedOrder
  })
}

export async function getAllOrders () {
  return prisma.order.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          lastname: true,
          email: true,
          phoneNumber: true
        }
      },
      items: true
    },
    orderBy: { createdAt: 'desc' }
  })
}
