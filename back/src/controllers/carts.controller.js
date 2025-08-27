const cartsService = require("../services/carts.service");

const createCart = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({
          error:
            'El campo "items" es requerido y debe ser un array con productos.',
        });
    }

    const newCart = await cartsService.create(items);

    res.status(201).json(newCart);
  } catch (error) {
    next(error);
  }
};

const updateCart = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({
          error:
            'El campo "items" es requerido y debe ser un array con productos.',
        });
    }

    const updatedCart = await cartsService.update(id, items);

    res.status(200).json(updatedCart);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCart,
  updateCart,
};
