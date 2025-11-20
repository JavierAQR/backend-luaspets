import * as productService from '../services/product.service.js'

export async function getAllProducts (req, res, next) {
  try {
    const products = await productService.getAllProducts()
    res.json(products)
  } catch (err) { next(err) }
}

export async function getProductById (req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id)
    res.json(product)
  } catch (err) { next(err) }
}

export async function createProduct (req, res, next) {
  try {
    const data = req.body
    const file = req.file // imagen opcional
    const product = await productService.createProduct(data, file)
    res.status(201).json(product)
  } catch (err) { next(err) }
}

export async function updateProduct (req, res, next) {
  try {
    const data = req.body
    const file = req.file
    const product = await productService.updateProduct(req.params.id, data, file)
    res.json(product)
  } catch (err) { next(err) }
}

export async function deleteProduct (req, res, next) {
  try {
    await productService.deleteProduct(req.params.id)
    res.status(204).end()
  } catch (err) { next(err) }
}
