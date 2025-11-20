// src/controllers/appointment.controller.js
import * as appointmentService from '../services/appointment.service.js'

// USER: sus citas
export async function getMyAppointments (req, res, next) {
  try {
    const userId = req.user.id
    const { status, dateFrom, dateTo } = req.query

    const appointments = await appointmentService.getAppointmentsForUser(userId, {
      status,
      dateFrom,
      dateTo
    })

    res.json(appointments)
  } catch (err) {
    next(err)
  }
}

// ADMIN: ver todas (con filtros opcionales)
export async function getAllAppointments (req, res, next) {
  try {
    const { status, dateFrom, dateTo, userId, petId, serviceId } = req.query

    const appointments = await appointmentService.getAllAppointments({
      status,
      dateFrom,
      dateTo,
      userId,
      petId,
      serviceId
    })

    res.json(appointments)
  } catch (err) {
    next(err)
  }
}

// USER o ADMIN: ver una cita por id
export async function getAppointmentById (req, res, next) {
  try {
    const user = req.user
    const { id } = req.params

    const appointment = await appointmentService.getAppointmentById(user, id)
    res.json(appointment)
  } catch (err) {
    next(err)
  }
}

// USER crea cita
export async function createAppointment (req, res, next) {
  try {
    const userId = req.user.id
    const data = req.body
    // data: { petId, serviceId, date, reason }

    const appointment = await appointmentService.createAppointment(userId, data)
    res.status(201).json(appointment)
  } catch (err) {
    next(err)
  }
}

// USER cancela su cita (o ADMIN)
export async function cancelAppointment (req, res, next) {
  try {
    const user = req.user
    const { id } = req.params

    const appointment = await appointmentService.cancelAppointment(user, id)
    res.json(appointment)
  } catch (err) {
    next(err)
  }
}

// ADMIN cambia estado (CONFIRMED, COMPLETED, CANCELLED)
export async function updateAppointmentStatus (req, res, next) {
  try {
    const { id } = req.params
    const { status } = req.body // esperado: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

    const appointment = await appointmentService.updateAppointmentStatus(id, status)
    res.json(appointment)
  } catch (err) {
    next(err)
  }
}
