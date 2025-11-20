import { Router } from 'express'
import * as serviceController from '../controllers/service.controller.js'
import { upload } from '../middlewares/upload.middleware.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { adminMiddleware } from '../middlewares/adminMiddleware.js'

const router = Router()

router.get('/', serviceController.getAllServices)
router.get('/:id', serviceController.getServiceById)

router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  serviceController.createService
)

router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  serviceController.updateService
)

router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  serviceController.deleteService
)

export default router
