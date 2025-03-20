const db = require("../models");
const ProductTemplate = db.product;
const Op = db.Sequelize.Op;
const deletePhoto = require('./filedelete.controller')


exports.createProduct = async (req, res) => {

  try {

    const data = await ProductTemplate.findOne({
      where: {
        name: req.body.name,
        createdby: req.userId
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
      product_type: req.body.product_type,
      categoryId: req.body.categoryId,
      name: req.body.name,
      description: req.body.description,
      image_url: req.body.image_url,
      cost: req.body.cost,
      price: req.body.price,
      brandId: req.body.brandId,
      createdby: req.userId,
      qty: req.body.qty,
    })

    res.status(200).send({
      success: true,
      message: "Product Create Successfully"
    })

  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }

}

exports.getProductTemplete = async (req, res) => {
  try {
    let data = await ProductTemplate.findAll({
      where: {
        createdby: req.userId
      }
    })

    res.status(200).send({
      success: true,
      items: data,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

exports.updateSingleProduct = async (req, res) => {
  try {
      const { id, name, image_url, url } = req.body;

      if (!id) {
          return res.status(400).send({
              success: false,
              message: "Order ID and status are required."
          });
      }


      const [updatedRowsCount] = await Brand.update(
          { name: name, image_url: image_url },
          { where: { id: id } }
      );

      if (updatedRowsCount === 0) {
          return res.status(404).send({
              success: false,
              message: "Order not found or status is already the same."
          });
      }
      deletePhoto(url)
      res.status(200).send({
          success: true,
          message: `Updated successfully`,
      });

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
        where: { id: pro?.id },
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
      message: "Product updated successfully",
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

exports.DeleteProduct = async (req, res) => {
  try {
      const { id, url } = req.body;

      if (!id) {
          return res.status(400).send({
              success: false,
              message: "Brand ID is required."
          });
      }

      const deletedRowsCount = await ProductTemplate.destroy({ where: { id } });

      if (deletedRowsCount === 0) {
          return res.status(404).send({
              success: false,
              message: "Brand not found."
          });
      }
      deletePhoto(url)
      res.status(200).send({
          success: true,
          message: "Brand deleted successfully.",
      });

  } catch (error) {
      res.status(500).send({ success: false, message: error.message });
  }
};
