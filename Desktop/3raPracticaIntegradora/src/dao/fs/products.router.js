import express from "express";
import { upload } from '../utils.js';
import ProductManager from "../ProductManager.js";
const router = express.Router();
const productManager = new ProductManager("src/products.json");


// Endpoints
router.get('/', async (req, res) => {
    try {
        const productos = await productManager.getProducts();
        const limit = parseInt(req.query.limit);

        let productosLimitados = limit && limit > 0 ? productos.slice(0, limit) : [...productos];

        res.status(200).json(productosLimitados);
        res.status(200).render('home', { layout: 'index', productosLimitados });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos', errorCode: 'INTERNAL_SERVER_ERROR' });
    }
});

router.get('/:idProduct', async (req, res) => {
    try {
        const productos = await productManager.getProducts();
        const idProduct = parseInt(req.params.idProduct);
        const producto = productos.find(u => u.id === idProduct);

        if (!producto) {
            res.status(404).json({ error: 'Producto no encontrado', errorCode: 'PRODUCT_NOT_FOUND' });
            return;
        }

        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el producto', errorCode: 'INTERNAL_SERVER_ERROR' });
    }
});

router.post('/', upload.single('thumbnails') , async (req, res) => {
    try {
        const newProduct = { ...req.body };
        if (req.file) {
            newProduct.thumbnails = req.file.filename;
        }

        const addedProduct = await productManager.addProduct(newProduct);
        if (addedProduct) {
            res.status(201).json(addedProduct);
        } else {
            res.status(400).json({ error: 'No se pudo agregar el producto', errorCode: 'PRODUCT_ADDITION_ERROR' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar el producto', errorCode: 'INTERNAL_SERVER_ERROR' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id, 10);
        const existingProduct = await productManager.getProductById(productId);

        if (!existingProduct || existingProduct.error) {
            return res.status(404).json({ error: 'Producto no encontrado', errorCode: 'PRODUCT_NOT_FOUND' });
        }

        const updatedProductData = req.body;
        updatedProductData.id = productId;

        const updatedProduct = await productManager.updateProduct(productId, updatedProductData);

        if (updatedProduct) {
            res.json(updatedProduct);
        } else {
            res.status(400).json({ error: 'No se pudo actualizar el producto', errorCode: 'PRODUCT_UPDATE_ERROR' });
        }
    } catch (error) {
        console.error("Error al actualizar el producto:", error.message);
        res.status(500).json({ error: 'Error al actualizar el producto', errorCode: 'INTERNAL_SERVER_ERROR' });
    }
});

router.delete('/:pid', async (req, res) => {
    const productId = parseInt(req.params.pid, 10);

    try {
        const deletedProduct = await productManager.deleteProduct(productId);

        if (deletedProduct) {
            res.json({ message: 'Producto eliminado correctamente', product: deletedProduct });
        } else {
            res.status(404).json({ error: 'Producto no encontrado', errorCode: 'PRODUCT_NOT_FOUND' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto', errorCode: 'INTERNAL_SERVER_ERROR' });
    }
});


export default router;
