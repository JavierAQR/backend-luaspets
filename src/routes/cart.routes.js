import { Router } from 'express'
import * as cartController from '../controllers/cart.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = Router()

// obtener el carrito activo
router.get('/', authMiddleware, cartController.getMyCart)

// agregar item
router.post('/items', authMiddleware, cartController.addItemToCart)

// actualizar cantidad de un item
router.put('/items/:itemId', authMiddleware, cartController.updateCartItem)

// quitar item
router.delete('/items/:itemId', authMiddleware, cartController.removeCartItem)

// limpiar carrito
router.delete('/', authMiddleware, cartController.clearCart)

// FUTURO: checkout (cuando veas pagos)
// router.post('/checkout', authMiddleware, cartController.checkout)

export default router
