import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/upload.middleware.js'
import * as userController from '../controllers/user.controller.js'

const router = Router()

router.put('/me', authMiddleware, upload.single('profileImage'), userController.updateProfile)

export default router
