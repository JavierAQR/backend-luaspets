import jwt from 'jsonwebtoken'
import { SECRET_JWT_KEY } from '../config/config.js'

export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, lastname: user.lastname, phoneNumber: user.phoneNumber },
    SECRET_JWT_KEY,
    { expiresIn: '1h' }
  )
}
