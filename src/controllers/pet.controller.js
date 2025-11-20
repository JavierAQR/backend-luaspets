// src/controllers/pet.controller.js
import * as petService from '../services/pet.service.js'

export async function getMyPets (req, res, next) {
  try {
    const userId = req.user.id
    const pets = await petService.getMyPets(userId)
    res.json(pets)
  } catch (err) {
    next(err)
  }
}

export async function getPetById (req, res, next) {
  try {
    const user = req.user
    const { id } = req.params

    const pet = await petService.getPetById(user, id)
    res.json(pet)
  } catch (err) {
    next(err)
  }
}

export async function createPet (req, res, next) {
  try {
    const userId = req.user.id
    const data = req.body
    const file = req.file // imagen opcional enviada como 'image'

    const pet = await petService.createPet(userId, data, file)
    res.status(201).json(pet)
  } catch (err) {
    next(err)
  }
}

export async function updatePet (req, res, next) {
  try {
    const user = req.user
    const { id } = req.params
    const data = req.body
    const file = req.file

    const pet = await petService.updatePet(user, id, data, file)
    res.json(pet)
  } catch (err) {
    next(err)
  }
}

export async function deletePet (req, res, next) {
  try {
    const user = req.user
    const { id } = req.params

    await petService.deletePet(user, id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
}
