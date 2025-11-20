import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import appointmentRoutes from './routes/appointment.routes.js'
import cartRoutes from './routes/cart.routes.js'
import petRoutes from './routes/pet.routes.js'
import productRoutes from './routes/product.routes.js'
import serviceRoutes from './routes/service.routes.js'

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)

app.use('/api/appointments', appointmentRoutes)
app.use('/api/carts', cartRoutes)
app.use('/api/pets', petRoutes)
app.use('/api/products', productRoutes)
app.use('/api/services', serviceRoutes)

export default app
