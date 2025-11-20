// src/services/appointment.service.js

import prisma from '../models/db.js'

function notFoundError (message = 'Cita no encontrada') {
  const error = new Error(message)
  error.statusCode = 404
  return error
}

function forbiddenError (message = 'No tienes permiso para acceder a esta cita') {
  const error = new Error(message)
  error.statusCode = 403
  return error
}

function badRequestError (message = 'Solicitud inválida') {
  const error = new Error(message)
  error.statusCode = 400
  return error
}

// Helpers para filtros de fecha
function buildDateFilter (dateFrom, dateTo) {
  if (!dateFrom && !dateTo) return undefined

  const filter = {}
  if (dateFrom) filter.gte = new Date(dateFrom)
  if (dateTo) filter.lte = new Date(dateTo)

  return filter
}

// ---------- CONSULTAS ----------

// Citas de un usuario (GET /appointments/me)
export async function getAppointmentsForUser (userId, {
  status,
  dateFrom,
  dateTo
} = {}) {
  const where = {
    userId
  }

  if (status) {
    where.status = status
  }

  const dateFilter = buildDateFilter(dateFrom, dateTo)
  if (dateFilter) {
    where.date = dateFilter
  }

  return prisma.appointment.findMany({
    where,
    orderBy: { date: 'desc' },
    include: {
      pet: true,
      service: true
    }
  })
}

// Citas para ADMIN con filtros
export async function getAllAppointments ({
  status,
  dateFrom,
  dateTo,
  userId,
  petId,
  serviceId
} = {}) {
  const where = {}

  if (status) where.status = status
  if (userId) where.userId = userId
  if (petId) where.petId = petId
  if (serviceId) where.serviceId = serviceId

  const dateFilter = buildDateFilter(dateFrom, dateTo)
  if (dateFilter) where.date = dateFilter

  return prisma.appointment.findMany({
    where,
    orderBy: { date: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          lastname: true,
          email: true,
          phoneNumber: true
        }
      },
      pet: true,
      service: true
    }
  })
}

// Cita por id (USER: solo suya, ADMIN: cualquiera)
export async function getAppointmentById (user, appointmentId) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          lastname: true,
          email: true,
          phoneNumber: true
        }
      },
      pet: true,
      service: true
    }
  })

  if (!appointment) throw notFoundError()

  if (user.role !== 'ADMIN' && appointment.userId !== user.id) {
    throw forbiddenError()
  }

  return appointment
}

// ---------- CREACIÓN ----------

export async function createAppointment (userId, data) {
  const { petId, serviceId, date, reason } = data

  if (!petId || !serviceId || !date) {
    throw badRequestError('petId, serviceId y date son obligatorios')
  }

  const dateObj = new Date(date)
  if (Number.isNaN(dateObj.getTime())) {
    throw badRequestError('Fecha de cita inválida')
  }

  // Ejemplo simple: opcionalmente no permitir fechas en el pasado
  const now = new Date()
  if (dateObj < now) {
    throw badRequestError('No se puede reservar una cita en el pasado')
  }

  // Verificar que la mascota exista y pertenezca al usuario
  const pet = await prisma.pet.findUnique({ where: { id: petId } })
  if (!pet) {
    throw badRequestError('La mascota seleccionada no existe')
  }
  if (pet.ownerId !== userId) {
    throw forbiddenError('La mascota seleccionada no pertenece al usuario')
  }

  // Verificar que el servicio exista y esté activo
  const service = await prisma.service.findUnique({ where: { id: serviceId } })
  if (!service || !service.isActive) {
    throw badRequestError('El servicio seleccionado no está disponible')
  }

  // (Opcional) Podrías verificar conflictos de horario aquí

  const appointment = await prisma.appointment.create({
    data: {
      user: { connect: { id: userId } },
      pet: { connect: { id: petId } },
      service: { connect: { id: serviceId } },
      date: dateObj,
      status: 'PENDING',
      reason: reason ?? null
    },
    include: {
      pet: true,
      service: true
    }
  })

  return appointment
}

// ---------- CANCELACIÓN ----------

export async function cancelAppointment (user, appointmentId) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId }
  })

  if (!appointment) throw notFoundError()

  // Solo dueño de la cita o ADMIN
  if (user.role !== 'ADMIN' && appointment.userId !== user.id) {
    throw forbiddenError()
  }

  if (appointment.status === 'COMPLETED') {
    throw badRequestError('No se puede cancelar una cita completada')
  }

  if (appointment.status === 'CANCELLED') {
    throw badRequestError('La cita ya está cancelada')
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: 'CANCELLED'
    },
    include: {
      pet: true,
      service: true
    }
  })

  return updated
}

// ---------- CAMBIO DE ESTADO (ADMIN) ----------

const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']

export async function updateAppointmentStatus (appointmentId, status) {
  if (!VALID_STATUSES.includes(status)) {
    throw badRequestError(
      `Estado inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}`
    )
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId }
  })
  if (!appointment) throw notFoundError()

  // Podrías implementar lógica de transición aquí, por ejemplo:
  // - No pasar de COMPLETED a PENDING, etc.

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          lastname: true,
          email: true,
          phoneNumber: true
        }
      },
      pet: true,
      service: true
    }
  })

  return updated
}
