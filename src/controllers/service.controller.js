// src/controllers/service.controller.js
import * as serviceService from '../services/service.service.js'

export async function getAllServices (req, res, next) {
  try {
    const services = await serviceService.getAllServices()
    res.json(services)
  } catch (err) {
    next(err)
  }
}

export async function getServiceById (req, res, next) {
  try {
    const { id } = req.params
    const service = await serviceService.getServiceById(id)
    res.json(service)
  } catch (err) {
    next(err)
  }
}

export async function createService (req, res, next) {
  try {
    const data = req.body
    const file = req.file // imagen enviada como 'image'

    const service = await serviceService.createService(data, file)
    res.status(201).json(service)
  } catch (err) {
    next(err)
  }
}

export async function updateService (req, res, next) {
  try {
    const { id } = req.params
    const data = req.body
    const file = req.file

    const service = await serviceService.updateService(id, data, file)
    res.json(service)
  } catch (err) {
    next(err)
  }
}

export async function deleteService (req, res, next) {
  try {
    const { id } = req.params
    await serviceService.deleteService(id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
}
