const productsService = require("../services/products.service");

const getAllProducts = async (req, res, next) => {
  try {
    const { q } = req.query;
    const products = await productsService.findAllProducts(q);
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productsService.findProductById(id);

    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: "Producto no encontrado" });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
};
