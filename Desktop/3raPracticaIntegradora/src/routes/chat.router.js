import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.render('chat', { style: '/css/styles.css' });
});

export default router;
