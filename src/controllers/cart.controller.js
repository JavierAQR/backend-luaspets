// src/controllers/cart.controller.js
import * as cartService from '../services/cart.service.js'

// GET /cart
export async function getMyCart (req, res, next) {
  try {
    const userId = req.user.id
    const cart = await cartService.getMyCart(userId)
    res.json(cart)
  } catch (err) {
    next(err)
  }
}

// POST /cart/items
export async function addItemToCart (req, res, next) {
  try {
    const userId = req.user.id
    const { productId, quantity } = req.body

    const cart = await cartService.addItemToCart(userId, { productId, quantity })
    res.status(201).json(cart)
  } catch (err) {
    next(err)
  }
}

// PUT /cart/items/:itemId
export async function updateCartItem (req, res, next) {
  try {
    const userId = req.user.id
    const { itemId } = req.params
    const { quantity } = req.body

    const cart = await cartService.updateCartItem(userId, itemId, quantity)
    res.json(cart)
  } catch (err) {
    next(err)
  }
}

// DELETE /cart/items/:itemId
export async function removeCartItem (req, res, next) {
  try {
    const userId = req.user.id
    const { itemId } = req.params

    const cart = await cartService.removeCartItem(userId, itemId)
    res.json(cart)
  } catch (err) {
    next(err)
  }
}

// DELETE /cart
export async function clearCart (req, res, next) {
  try {
    const userId = req.user.id

    const cart = await cartService.clearCart(userId)
    res.json(cart)
  } catch (err) {
    next(err)
  }
}
