// routes/dashboard.routes.js
import { Router } from 'express'
import * as dashboardController from '../controllers/dashboard.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { adminMiddleware } from '../middlewares/adminMiddleware.js'

const router = Router()

// GET /admin/dashboard
router.get(
  '/',
  authMiddleware,
  adminMiddleware,
  dashboardController.getDashboardSummary
)

export default router
