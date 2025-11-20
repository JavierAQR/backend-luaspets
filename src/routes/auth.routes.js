import { Router } from 'express'
import * as authController from '../controllers/auth.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = Router()

router.post('/login', authController.login)
router.post('/register', authController.register)
router.post('/logout', authController.logout)
router.post('/update-password', authMiddleware, authController.updatePassword)
router.post('/recover-password', authController.recoverPassword)
router.post('/reset-password', authController.resetPassword)

export default router
