import * as orderService from '../services/order.service.js'

export async function createOrder (req, res, next) {
  try {
    const userId = req.user.id
    const shippingInfo = req.body

    const order = await orderService.createOrderFromCart(userId, shippingInfo)
    res.status(201).json(order)
  } catch (err) {
    next(err)
  }
}

export async function getMyOrders (req, res, next) {
  try {
    const userId = req.user.id
    const orders = await orderService.getMyOrders(userId)
    res.json(orders)
  } catch (err) {
    next(err)
  }
}

export async function getOrderById (req, res, next) {
  try {
    const userId = req.user.id
    const orderId = req.params.id

    const order = await orderService.getOrderById(userId, orderId)
    res.json(order)
  } catch (err) {
    next(err)
  }
}

export async function completeOrder (req, res, next) {
  try {
    const userId = req.user.id
    const orderId = req.params.id
    const { paypalOrderId } = req.body

    const order = await orderService.completeOrder(userId, orderId, paypalOrderId)
    res.json(order)
  } catch (err) {
    next(err)
  }
}
