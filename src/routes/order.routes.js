import express from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import * as orderController from '../controllers/order.controller.js'

const router = express.Router()

// Crear orden desde el carrito
router.post('/', authMiddleware, orderController.createOrder)

// Ver mis órdenes
router.get('/me', authMiddleware, orderController.getMyOrders)

// Ver una orden específica
router.get('/:id', authMiddleware, orderController.getOrderById)

export default router
