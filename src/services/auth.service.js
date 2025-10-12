import bcrypt from 'bcrypt'
import { generateToken } from '../utils/token.js'
import prisma from '../models/db.js'
import nodemailer from 'nodemailer'
import { EMAIL_PASS, EMAIL_USER } from '../config/config.js'

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10')

export const register = async ({ name, lastname, phoneNumber, password, email }) => {
  if (!name || !email || !password) throw new Error('Todos los campos son requeridos')

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error('El correo ingresado ya está asociado a un usuario existente')

  const hashed = await bcrypt.hash(password, SALT_ROUNDS)
  const user = await prisma.user.create({
    data: { name, lastname, phoneNumber, email, password: hashed },
    select: { id: true, name: true, lastname: true, email: true }
  })
  return user
}

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error('Usuario no encontrado')

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) throw new Error('El correo o la contraseña son incorrectos')

  const token = generateToken(user)

  return { user: { id: user.id, name: user.name, lastname: user.lastname, email: user.email, phoneNumber: user.phoneNumber }, token }
}

export const updatePassword = async (userId, oldPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('Usuario no encontrado')

  const valid = await bcrypt.compare(oldPassword, user.password)
  if (!valid) throw new Error('Contraseña original incorrecta')

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS)
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } })
}

export const recoverPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error('Usuario no encontrado')

  // Genera un código de 6 dígitos
  const code = Math.floor(100000 + Math.random() * 900000).toString()

  // Guarda el código en la BD con expiración de 10 minutos
  await prisma.passwordReset.upsert({
    where: { email },
    update: {
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    },
    create: {
      email,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    }
  })

  // Configurar transporte para enviar el correo
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  })

  // Enviar el correo
  await transporter.sendMail({
    from: `"Soporte" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Código de recuperación de contraseña',
    html: `
        <p>Hola ${user.name || ''},</p>
        <p>Tu código para restablecer tu contraseña es:</p>
        <h2>${code}</h2>
        <p>Este código expirará en 10 minutos.</p>
      `
  })
}

export const resetPassword = async (email, code, newPassword) => {
  const record = await prisma.passwordReset.findUnique({ where: { email } })

  if (!record) { throw new Error('No existe una solicitud con este correo electrónico') }

  if (record.code !== code) { throw new Error('Código inválido') }

  if (record.expiresAt < new Date()) { throw new Error('El código ha expirado') }

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  })

  // Borra el código usado
  await prisma.passwordReset.delete({ where: { email } })
}
