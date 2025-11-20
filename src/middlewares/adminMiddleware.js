export function adminMiddleware (req, res, next) {
  try {
    const user = req.user

    if (!user) {
      return res.status(401).json({ message: 'No autorizado' })
    }
    console.log(user)

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Acceso denegado. Se requiere rol ADMIN.' })
    }

    next()
  } catch (err) {
    next(err)
  }
}
