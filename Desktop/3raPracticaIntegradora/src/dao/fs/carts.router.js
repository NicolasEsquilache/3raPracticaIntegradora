import express from "express";
const router = express.Router();
import CartManager from "../CartManager.js";
const cartManager = new CartManager("src/carts.json");

// Endpoints
router.post('/', async (req, res) => {
    try { 
        const addedCart = await cartManager.createCart();
        if (addedCart) {
            res.status(201).json(addedCart);
        } else {
            res.status(500).json({ error: 'No se pudo crear el carrito', errorCode: 'CART_CREATION_ERROR' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el carrito', errorCode: 'INTERNAL_SERVER_ERROR' });
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    const cartId = parseInt(req.params.cid, 10);
    const productId = parseInt(req.params.pid, 10);

    try {
        const updatedCart = await cartManager.addProductToCart(cartId, productId);
        if (updatedCart) {
            res.json(updatedCart);
        } else {
            res.status(404).json({ error: 'Carrito no encontrado', errorCode: 'CART_NOT_FOUND' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar producto al carrito', errorCode: 'INTERNAL_SERVER_ERROR' });
    }
});

router.get('/:cid', async (req, res) => {
    const cartId = parseInt(req.params.cid, 10);
    try {
        const cart = await cartManager.getCart(cartId);
        if (cart) {
            res.json(cart);
        } else {
            res.status(404).json({ error: 'Carrito no encontrado', errorCode: 'CART_NOT_FOUND' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el carrito', errorCode: 'INTERNAL_SERVER_ERROR' });
    }
});

export default router;
