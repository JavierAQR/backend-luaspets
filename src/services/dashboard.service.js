// services/dashboard.service.js
import prisma from '../models/db.js'

export async function getDashboardSummary () {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  const [
    totalUsers,
    totalAdmins,
    totalPets,
    totalActiveServices,
    totalActiveProducts,
    totalAppointments,
    pendingAppointments,
    confirmedAppointments,
    cancelledAppointments,
    completedAppointments,
    appointmentsToday,
    upcomingAppointments,
    lowStockProducts,
    recentUsers
  ] = await Promise.all([
    // Usuarios
    prisma.user.count(),
    prisma.user.count({
      where: { role: 'ADMIN' }
    }),

    // Mascotas
    prisma.pet.count(),

    // Servicios activos
    prisma.service.count({
      where: { isActive: true }
    }),

    // Productos activos
    prisma.product.count({
      where: { isActive: true }
    }),

    // Total citas
    prisma.appointment.count(),

    // Citas por estado
    prisma.appointment.count({ where: { status: 'PENDING' } }),
    prisma.appointment.count({ where: { status: 'CONFIRMED' } }),
    prisma.appointment.count({ where: { status: 'CANCELLED' } }),
    prisma.appointment.count({ where: { status: 'COMPLETED' } }),

    // Citas de hoy
    prisma.appointment.count({
      where: {
        date: {
          gte: startOfToday,
          lt: endOfToday
        }
      }
    }),

    // Próximas citas (solo pendientes/confirmadas)
    prisma.appointment.findMany({
      where: {
        date: { gte: now },
        status: { in: ['PENDING', 'CONFIRMED'] }
      },
      orderBy: { date: 'asc' },
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastname: true,
            phoneNumber: true,
            email: true
          }
        },
        pet: true,
        service: true
      }
    }),

    // Productos con poco stock
    prisma.product.findMany({
      where: {
        isActive: true,
        stock: { lte: 5 }
      },
      orderBy: { stock: 'asc' },
      take: 5,
      select: {
        id: true,
        name: true,
        stock: true,
        price: true,
        imageUrl: true,
        category: true
      }
    }),

    // Últimos usuarios registrados
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        lastname: true,
        email: true,
        phoneNumber: true,
        createdAt: true,
        role: true
      }
    })
  ])

  return {
    cards: {
      totalUsers,
      totalAdmins,
      totalPets,
      totalActiveServices,
      totalActiveProducts,
      totalAppointments,
      appointmentsToday
    },
    appointmentsByStatus: {
      PENDING: pendingAppointments,
      CONFIRMED: confirmedAppointments,
      CANCELLED: cancelledAppointments,
      COMPLETED: completedAppointments
    },
    upcomingAppointments,
    lowStockProducts,
    recentUsers
  }
}
