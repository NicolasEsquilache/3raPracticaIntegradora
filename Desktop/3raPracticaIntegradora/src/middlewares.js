// Middleware de rutas públicas
export const publicRoute = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/products'); 
    }
    next(); 
};

// Middleware de rutas privadas
export const privateRoute = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login'); 
        }
    next(); 
};