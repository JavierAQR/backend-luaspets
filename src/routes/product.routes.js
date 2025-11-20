import { Router } from 'express'
import * as productController from '../controllers/product.controller.js'
import { upload } from '../middlewares/upload.middleware.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { adminMiddleware } from '../middlewares/adminMiddleware.js'

const router = Router()

// Públicos
router.get('/', productController.getAllProducts)
router.get('/:id', productController.getProductById)

// Solo ADMIN
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  productController.createProduct
)

router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  productController.updateProduct
)

router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  productController.deleteProduct
)

export default router
