import { Router } from "express";
import { productModel } from "../dao/models/product.model.js";

const productsRouter = Router();

productsRouter.get('/', async (req, res) => {
    const { limit = 3, page = 1, category, availability, sort } = req.query;
    try {
        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            lean: true
        };

        const filter = {};
        if (category) {
            filter.category = category;
        }
        if (availability) {
            filter.stock = availability === 'available' ? { $gt: 0 } : { $eq: 0 };
        }

        const sortOptions = {};
        if (sort === '1' || sort === '-1') {
            sortOptions.price = parseInt(sort); // Ordenar por precio ascendente (1) o descendente (-1)
        }

        const products = await productModel.paginate(filter, { ...options, sort: sortOptions });

        const prevLink = products.hasPrevPage ? `/api/products?page=${products.prevPage}` : null;
        const nextLink = products.hasNextPage ? `/api/products?page=${products.nextPage}` : null;
        const response = {
            status: 'success',
            payload: products.docs,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: prevLink,
            nextLink: nextLink
        };

        res.status(200).send({ result: 'Success', message: response });
    } catch (error) {
        res.status(400).send({ status: 'error', payload: [], message: error.message });
    }
});

productsRouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await productModel.findById(id);
        if (!product) return res.status(404).send('Product not found');
        res.status(200).send({ result: 'Success', message: product });
    } catch (error) {
        res.status(404).send({ result: 'Error', message: 'Not found' });
    }
});

productsRouter.post('/', async (req, res) => {
    const { title, description, price, thumbnails, code, stock, category } = req.body;
    try {
        const prod = await productModel.create({ title, description, price, thumbnails, code, stock, category });
        res.status(201).send({ result: "Success", message: prod });
    } catch (error) {
        res.status(400).send({ result: 'Error create product', message: error.message });
    }
});

productsRouter.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, price, thumbnails, code, stock, status, category } = req.body;
    try {
        const product = await productModel.findByIdAndUpdate(id, { title, description, price, thumbnails, code, stock, status, category });
        if (!product) return res.status(404).send({ result: 'Error', message: 'Product not found' });
        res.status(200).send({ result: 'Success', message: 'Product updated' });
    } catch (error) {
        res.status(400).send({ result: 'Error updating product', message: error });
    }
});

productsRouter.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await productModel.findByIdAndDelete(id);
        if (!product) return res.status(404).send({ result: 'Error', message: 'Product not found' });
        res.status(200).send({ result: 'Success', message: 'Product deleted', product });
    } catch (error) {
        res.status(400).send({ result: 'Error deleting product', message: error });
    }
});

export default productsRouter;
