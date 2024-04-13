import { promises as fs } from 'fs';

export default class ProductManager {
    constructor(path) {
        this.productos = [];
        this.nextId = 1;
        this.path = path;
    }

    async getProducts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error al leer el archivo:', error);
            return [];
        }
    }

    async getProductById(id) {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            const productos = JSON.parse(data);
            const producto = productos.find((p) => p.id === id);
            if (!producto) throw new Error('Producto no encontrado');
            return producto;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }

    async updateProduct(id, updatedProduct) {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            let productos = [];

            if (data) {
                try {
                    productos = JSON.parse(data);
                    if (!Array.isArray(productos)) throw new Error('El archivo no contiene un arreglo JSON válido.');
                } catch (parseError) {
                    throw new Error('El archivo no contiene un formato JSON válido.');
                }
            }

            const productoIndex = productos.findIndex((p) => p.id === id);

            if (productoIndex === -1) throw new Error('Producto no encontrado');

            productos[productoIndex] = { ...productos[productoIndex], ...updatedProduct };

            await fs.writeFile(this.path, JSON.stringify(productos), 'utf-8');

            return productos[productoIndex];
        } catch (error) {
            console.error('Error al actualizar el producto:', error.message);
            throw error;
        }
    }

    async addProduct(producto) {
        try {
            if (!producto.title || !producto.description || !producto.price || !producto.category || !producto.code || !producto.stock) {
                console.error('Todos los campos son obligatorios.');
                return;
            }

            let productos = JSON.parse(await fs.readFile(this.path, 'utf-8'));

            if (productos.some((p) => p.code === producto.code)) {
                console.error('El código ya existe.');
                return;
            }

            const maxId = Math.max(...productos.map(p => p.id));

            producto.id = maxId + 1;
            const { title, description, code, price, stock, category, thumbnails } = producto;

            const nuevoProducto = {
                id: producto.id,
                title,
                description,
                code,
                price,
                status: true,
                stock,
                category,
                thumbnails: [thumbnails]
            };

            productos.push(nuevoProducto);

            await fs.writeFile(this.path, JSON.stringify(productos), 'utf-8');

            return nuevoProducto;
        } catch (error) {
            console.error('Error al agregar el producto:', error);
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            let productos = [];

            if (data) {
                try {
                    productos = JSON.parse(data);
                    if (!Array.isArray(productos)) throw new Error('El archivo no contiene un arreglo JSON válido.');
                } catch (parseError) {
                    throw new Error('El archivo no contiene un formato JSON válido.');
                }
            }

            const productoIndex = productos.findIndex((p) => p.id === id);

            if (productoIndex === -1) throw new Error('Producto no encontrado');

            const productoEliminado = productos.splice(productoIndex, 1)[0];

            await fs.writeFile(this.path, JSON.stringify(productos), 'utf-8');

            return productoEliminado;
        } catch (error) {
            console.error('Error al eliminar el producto:', error.message);
            throw error;
        }
    }
}
