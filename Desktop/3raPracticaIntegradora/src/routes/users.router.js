import { Router } from 'express';
import User from '../dao/models/user.js'
import passport from 'passport';
import { createHash, isValidatePassword } from '../pass.js'
import { createCart } from './carts.router.js'
const router = Router();

router.post('/register', passport.authenticate('register', { failureRedirect: '/failregister' }), async (req, res) => {
    // Crea un nuevo carrito para el usuario registrado
    try {
        //console.log(req.user);
        const cartResult = await createCart();
        //console.log(cartResult);
        const user = await User.findByIdAndUpdate(req.user._id, { cartId: cartResult._id });
        req.session.user = user;
        console.log(user);
        res.send({ status: "success", message: "Usuario registrado y carrito creado" });
    } catch (error) {
        res.status(500).send({ status: "error", error: "Error al registrar usuario y crear carrito" });
    }
});

router.post("/login", passport.authenticate('login', { failureRedirect: '/faillogin' }), async (req, res) => {
    if (!req.user) return res.status(400).send({ status: 'error', error: 'Credenciales inválidas' })

    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        email: req.user.email
    }
    //res.send({ status: "success", payload: req.user })   
    res.redirect('/login')
});

router.get("/github", passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => { })

router.get("/githubcallback", passport.authenticate('github', { failureRedirect: '/login' }), async (req, res) => {
    try {
        // Verifica si el usuario está autenticado
        if (!req.user) {
            return res.status(401).send({ status: 'error', error: 'Usuario no autenticado' });
        }
    
        // Verifica si el usuario ya tiene un carrito asignado
        if (req.user.cartId) {
            return res.redirect('/login'); // Si el usuario ya tiene un carrito, redirige a la página de inicio de sesión
        }

        // Crea un nuevo carrito para el usuario
        const cart = await createCart();

        // Asigna el ID del carrito al usuario
        const updatedUser = await User.findByIdAndUpdate(req.user._id, { cartId: cart._id });
        req.session.user = updatedUser;

        // Redirige al usuario a la página de inicio de sesión
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: 'error', error: 'Error al procesar la autenticación con GitHub' });
    }
});
//Restore password
router.post('/restore', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ status: "error", error: "Correo electrónico y nueva contraseña requeridos" });
    }

    try {
        const updatedUser = await User.findOneAndUpdate(
            { email: email },
            { password: createHash(password) },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).send({ status: "error", error: "Usuario no encontrado" });
        }

        req.session.user = updatedUser;
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: "error", error: "Error al actualizar la contraseña" });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).send('Error al cerrar sesión');
        }
        res.redirect('/login');
    });
});

router.get('/current', (req, res) => {
    try {
        // Verificar si hay un usuario en la sesión
        if (req.session.user) {
            // Si hay un usuario en la sesión, devolverlo en la respuesta
            res.status(200).json({ user: req.session.user });
        } else {
            // Si no hay un usuario en la sesión, devolver un mensaje indicando que no hay usuario
            res.status(404).json({ message: 'No hay usuario actualmente autenticado' });
        }
    } catch (error) {
        // Manejo de errores
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el usuario actual' });
    }
});



export default router;
