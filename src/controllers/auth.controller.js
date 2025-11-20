import * as authService from '../services/auth.service.js'

export const register = async (req, res) => {
  try {
    const user = await authService.register(req.body)
    res.status(200).json(user)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const login = async (req, res) => {
  try {
    const data = await authService.login(req.body)
    res.json(data)
  } catch (err) {
    res.status(401).json({ message: err.message })
  }
}

export const logout = (req, res) => {
  res.clearCookie('token')
  res.json({ message: 'Logout succesful' })
}

export const updatePassword = async (req, res) => {
  try {
    const userId = req.user.userId
    const { oldPassword, newPassword } = req.body
    await authService.updatePassword(userId, oldPassword, newPassword)
    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const recoverPassword = async (req, res) => {
  try {
    const { email } = req.body
    await authService.recoverPassword(email)
    res.json({ message: 'Correo de recuperación enviado' })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body
    await authService.resetPassword(email, code, newPassword)
    res.json({ message: 'Contraseña actualizada correctamente' })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
