import * as userService from '../services/user.service.js'

export const getProfile = async (req, res) => {
  res.json(req.user)
}

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id // setear por authMiddleware
    // campos normales en body
    const { name, lastname, phoneNumber, address, removeImage } = req.body
    // file (si se subió)
    const file = req.file // multer coloca el buffer en req.file.buffer

    const updated = await userService.updateProfile(userId, {
      name,
      lastname,
      phoneNumber,
      address,
      removeImage: removeImage === 'true' || removeImage === true // por si viene como string
    }, file)

    // devolver sin password
    const { password, ...publicUser } = updated
    res.json(publicUser)
  } catch (err) {
    console.error('updateProfile error:', err)
    res.status(400).json({ message: err.message || 'Error actualizando perfil' })
  }
}
