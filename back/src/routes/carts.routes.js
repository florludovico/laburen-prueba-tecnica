const { Router } = require('express');
const cartsController = require('../controllers/carts.controller');

const router = Router();

router.post('/', cartsController.createCart);
router.patch('/:id', cartsController.updateCart);

module.exports = router;