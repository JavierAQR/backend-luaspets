import { Router } from 'express'
import * as appointmentController from '../controllers/appointment.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { adminMiddleware } from '../middlewares/adminMiddleware.js'

const router = Router()

// USER: sus citas
router.get('/me', authMiddleware, appointmentController.getMyAppointments)

// ADMIN: ver todas (con filtros opcionales)
router.get(
  '/',
  authMiddleware,
  adminMiddleware,
  appointmentController.getAllAppointments
)

router.get(
  '/:id',
  authMiddleware,
  appointmentController.getAppointmentById
)

// USER crea cita
router.post(
  '/',
  authMiddleware,
  appointmentController.createAppointment
)

// USER cancela su cita (o admin)
router.delete(
  '/:id',
  authMiddleware,
  appointmentController.cancelAppointment
)

// ADMIN cambia estado (CONFIRMED, COMPLETED, CANCELLED)
router.patch(
  '/:id/status',
  authMiddleware,
  adminMiddleware,
  appointmentController.updateAppointmentStatus
)

export default router
