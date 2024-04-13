import { Router } from "express";
import { productModel } from "../dao/models/product.model.js";
import { cartModel } from "../dao/models/cart.model.js";
import { publicRoute, privateRoute } from '../middlewares.js';
const router = Router();



router.get('/realtimeproducts', privateRoute, async (req, res) => {
    res.render('realTimeProducts', { style: '/css/styles.css' });
});

router.get('/products', async (req, res) => {
    const { limit = 3, page = 1 } = req.query;
    try {
        const user = req.session.user;
        const products = await productModel.paginate({}, { limit, page, lean: true });

        const prevLink = products.hasPrevPage ? `/products?page=${products.prevPage}` : null;
        const nextLink = products.hasNextPage ? `/products?page=${products.nextPage}` : null;
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

        res.status(200).render('products', {
            style: '/css/styles.css',
            title: "All Products paginated",
            user,
            response
        });
    } catch (error) {
        res.status(500).send({ result: 'Error', message: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const allProducts = await productModel.find({}, { _id: 0, __v: 0 }).lean();
        res.render('home', {
            style: '/css/styles.css',
            title: "All Products",
            allProducts
        });
    } catch (error) {
        res.status(500).send('Internal server Error', error);
    }
});

router.get('/carts/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await cartModel.findById(cid).populate('products.product').lean();
        if (!cart) {
            return res.status(404).send({ result: 'Error', message: 'Cart not found' });
        }
        res.status(200).render('cart', { title: "Cart", result: 'Success', message: cart });

    } catch (error) {
        res.status(400).send({ result: 'Error', message: error.message });
    }
});
//agregado
router.get("/login", publicRoute, (req, res) => {

    res.render("login"); 
});

router.get("/register", publicRoute, (req, res) => {

    res.render("register"); 
});

router.get("/profile", privateRoute, async (req, res) => {

    const { first_name, last_name, email, age } = req.session.user;
    res.render("profile", { first_name, last_name, age, email });
});

router.get('/restore', (req, res) => {
    const email = req.query.email || '';
    res.render('restore', { email });
});

router.get('/failregister', async (req, res) => {
    console.log('Registro fallido')
    res.send({ error: "failed" })
});

router.get('/faillogin', (req, res) => {
    res.send({ error: 'Login fallido' })
});

export default router;