import { Router } from 'express'
import * as petController from '../controllers/pet.controller.js'
import { upload } from '../middlewares/upload.middleware.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/', authMiddleware, petController.getMyPets)
router.get('/:id', authMiddleware, petController.getPetById)

router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  petController.createPet
)

router.put(
  '/:id',
  authMiddleware,
  upload.single('image'),
  petController.updatePet
)

router.delete('/:id', authMiddleware, petController.deletePet)

export default router
