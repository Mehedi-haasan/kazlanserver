const db = require("../models");
const ProductTemplate = db.productTemplete;
const { Sequelize, QueryTypes, where } = require("sequelize");
const sequelize = db.sequelize;
const Op = db.Sequelize.Op;


function getFormattedDate() {
  const date = new Date();
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
}



exports.createProduct = async (req, res) => {

  try {

    const data = await ProductTemplate.findOne({
      where: {
        name: req.body.name
      }
    })

    if (data) {
      res.status(200).send({
        success: true,
        message: "Product already exist"
      })
    }

    await ProductTemplate.create({
      acitve: 1,
      sequence: "10",
      categoryId: req.body.categoryId,
      name: req.body.name,
      description: req.body.description,
      image_url: req.body.image_url,
      cost: req.body.cost,
      price: req.body.price,
      standard_price: req.body.standard_price,
      qty: req.body.qty,
      product_type: true,
    })

    res.status(200).send({
      success: true,
      message: "Product Create Successfully"
    })

  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }

}


exports.searchProduct = async (req, res) => {
  const searchTerm = req.params.product;
  try {
    let data = await ProductTemplate.findAll({
      where: {
        name: {
          [Op.like]: `%${searchTerm}%` // Use LIKE for partial match
        }
      }
    });

    res.status(200).send({
      success: true,
      items: data,
    });

  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};



exports.UpdateProduct = async (req, res) => {
  const updateProducts = req.body;

  if (!Array.isArray(updateProducts) || updateProducts.length === 0) {
    return res.status(400).send({ success: false, message: "Invalid or empty product update data" });
  }

  try {
    const Products = [];

    for (const pro of updateProducts) {
      const product = await ProductTemplate.findOne({
        where: { id: pro?.product_id },
      });

      if (product) {
        await ProductTemplate.update(
          {
            qty: parseInt(product.qty) + parseInt(pro?.qty),
          },
          {
            where: {
              id: product?.id,
            },
          }
        );
      } else {
        console.log(`Product with ID ${pro?.product_id} not found`);
      }
    }

    res.status(200).send({
      success: true,
      items: Products,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};



exports.getProductTemplete = async (req, res) => {
  try {
    let data = await ProductTemplate.findAll({

    })

    res.status(200).send({
      success: true,
      items: data,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

exports.DeleteProductTemplate = async (req, res) => {
  const { id } = req.body;
  try {
    const deletedCount = await ProductTemplate.destroy({
      where: { id: id }
    });

    if (deletedCount > 0) {
      res.status(200).send({
        success: true,
        message: `ProductTemplate with id ${id} deleted successfully.`,
      });
    } else {
      res.status(404).send({
        success: false,
        message: `No ProductTemplate found with id ${id}.`,
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};
