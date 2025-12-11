import { authMiddleware } from '../middlewares/auth.middleware.js'
import * as orderController from '../controllers/order.controller.js'
import { Router } from 'express'
import { adminMiddleware } from '../middlewares/adminMiddleware.js'

const router = Router()

// Crear orden desde el carrito
router.post('/', authMiddleware, orderController.createOrder)

// Ver mis órdenes
router.get('/me', authMiddleware, orderController.getMyOrders)

// Ver una orden específica
router.get('/:id', authMiddleware, orderController.getOrderById)

router.patch('/:id/complete', authMiddleware, orderController.completeOrder)

router.get('/', authMiddleware, adminMiddleware, orderController.getAllOrders)

export default router
