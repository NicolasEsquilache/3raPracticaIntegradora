import { Router } from 'express';
import { cartModel } from '../dao/models/cart.model.js';
import { productModel } from '../dao/models/product.model.js';

const cartsRouter = Router();

const createCart = async () => {
    try {
        const cart = await cartModel.create({ products: [] });
        console.log(cart);
        return (cart);
    } catch (error) {
        console.log("Cart error: " + error)
        throw new Error(error.message);
    }
}

cartsRouter.get('/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await cartModel.findById(cid).populate('products.product');
        if (!cart) {
            return res.status(404).send({ result: 'Error', message: 'Cart not found' });
        }
        res.status(200).send({ result: 'Success', message: cart });
    } catch (error) {
        res.status(400).send({ result: 'Error', message: error.message });
    }
});

cartsRouter.post('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity = 1 } = req.body;

    try {
        const cart = await cartModel.findById(cid);
        const product = await productModel.findById(pid);

        if (!cart) return res.status(404).send({ result: 'Error', message: 'Cart not found' });
        if (!product) return res.status(404).send({ result: 'Error', message: 'Product not found' });

        const existingProductIndex = cart.products.findIndex(prod => prod.product.toString() === pid);
        if (existingProductIndex !== -1) {
            cart.products[existingProductIndex].quantity += quantity;
        } else {
            cart.products.push({ product: pid, quantity });
        }
        await cart.save();
        res.status(200).send({ result: 'Success', message: 'Product added to cart' });
    } catch (error) {
        res.status(400).send({ result: 'Error', message: error.message });
    }
});

cartsRouter.delete('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;

    try {
        const cart = await cartModel.findById(cid);

        if (!cart) {
            return res.status(404).send({ result: 'Error', message: 'Cart not found' });
        }

        const productIndex = cart.products.findIndex(prod => prod.product.toString() === pid);

        if (productIndex === -1) {
            return res.status(404).send({ result: 'Error', message: 'Product not found in the cart' });
        }

        cart.products.splice(productIndex, 1);

        await cart.save();

        res.status(200).send({ result: 'Success', message: 'Product removed from cart' });
    } catch (error) {
        res.status(400).send({ result: 'Error', message: error.message });
    }
});

cartsRouter.put('/:cid', async (req, res) => {
    const { cid } = req.params;
    console.log(req.body);
    try {
        const cart = await cartModel.findById(cid);

        if (!cart) {
            return res.status(404).send({ result: 'Error', message: 'Cart not found' });
        }

        cart.products = req.body;

        await cart.save();

        res.status(200).send({ result: 'Success', message: 'Cart updated successfully' });
    } catch (error) {
        res.status(400).send({ result: 'Error', message: error.message });
    }
});

cartsRouter.put('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    try {
        const cart = await cartModel.findById(cid);

        if (!cart) {
            return res.status(404).send({ result: 'Error', message: 'Cart not found' });
        }

        const productIndex = cart.products.findIndex(product => product.product.toString() === pid);

        if (productIndex === -1) {
            return res.status(404).send({ result: 'Error', message: 'Product not found in cart' });
        }

        cart.products[productIndex].quantity = quantity;

        await cart.save();

        res.status(200).send({ result: 'Success', message: 'Product quantity updated successfully' });
    } catch (error) {
        res.status(400).send({ result: 'Error', message: error.message });
    }
});

cartsRouter.delete('/:cid', async (req, res) => {
    const { cid } = req.params;

    try {
        const cart = await cartModel.findById(cid);

        if (!cart) {
            return res.status(404).send({ result: 'Error', message: 'Cart not found' });
        }

        cart.products = [];

        await cart.save();

        res.status(200).send({ result: 'Success', message: 'All products removed from cart' });
    } catch (error) {
        res.status(400).send({ result: 'Error', message: error.message });
    }
});


export default cartsRouter;
export { createCart };
