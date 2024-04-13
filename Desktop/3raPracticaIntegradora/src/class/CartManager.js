import { promises as fs } from 'fs';

export default class CartManager {
    constructor(path) {
        this.path = path;
        this.nextId = 1;
    }

    async createCart() {
        try {
            const carts = await this.readCarts();
            const lastCartId = carts.reduce((max, cart) => (cart.id > max ? cart.id : max), 0);
            
            const newCart = { id: lastCartId + 1, products: [] };
            await this.saveCart(newCart);

            return newCart;
        } catch (error) {
            throw error;
        }
    }

    async saveCart(cart) {
        try {
            const carts = await this.readCarts();
            const existingCartIndex = carts.findIndex((c) => c.id === cart.id);

            if (existingCartIndex !== -1) {
                carts[existingCartIndex] = cart;
            } else {
                carts.push(cart);
            }

            await fs.writeFile(this.path, JSON.stringify(carts, null, 2), 'utf-8');
        } catch (error) {
            throw error;
        }
    }

    async loadCart(cartId) {
        try {
            const carts = await this.readCarts();
            return carts.find((cart) => cart.id === cartId) || null;
        } catch (error) {
            console.log("Error: ", error);
            return null;
        }
    }

    async addProductToCart(cartId, productId) {
        try {
            const cart = await this.loadCart(cartId);

            if (!cart) {
                return null;
            }

            const existingProduct = cart.products.find((product) => product.id === productId);

            if (existingProduct) {
                existingProduct.quantity++;
            } else {
                cart.products.push({ id: productId, quantity: 1 });
            }

            await this.saveCart(cart);

            return cart;
        } catch (error) {
            throw error;
        }
    }

    async getCart(cartId) {
        try {
            return await this.loadCart(cartId);
        } catch (error) {
            throw error;
        }
    }

    async readCarts() {
        try {
            const content = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(content) || [];
        } catch (error) {
            console.log("Error reading carts: ", error);
            return [];
        }
    }
}
