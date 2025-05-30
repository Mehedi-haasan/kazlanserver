const { where } = require("sequelize");
const db = require("../models");
const Product = db.product;
const Customer = db.customer;
const Op = db.Sequelize.Op;
const deletePhoto = require('./filedelete.controller')

function getFormattedDate() {
  const date = new Date();
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-EN', options);
}

exports.createProduct = async (req, res) => {

  try {

    const data = await Product.findOne({
      where: {
        name: req.body.name,
        compId: req.compId
      }
    })

    if (data) {
      res.status(200).send({
        success: true,
        message: "Product already exist"
      })
    }

    await Product.create({
      active: true,
      product_type: req.body.product_type,
      categoryId: req.body.categoryId,
      compId: req.body.compId ? req.body.compId : req.compId,
      supplier: req.body.supplier,
      name: req.body.name,
      description: req.body.description,
      image_url: req.body.image_url,
      cost: req.body.cost,
      price: req.body.price,
      brandId: req.body.brandId,
      createdby: req.userId,
      creator: req.user,
      qty: req.body.qty,
      qty_type: req.body.qty_type,
      discount: req.body.discount,
      discount_type: req.body.discount_type
    })


    res.status(200).send({
      success: true,
      message: "Item Created Successfully"
    })

  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }

}

exports.getProductTemplete = async (req, res) => {
  const page = parseInt(req.params.page) || 1;
  const pageSize = parseInt(req.params.pageSize) || 10;
  const brandId = parseInt(req.params.brandId);
  const catId = parseInt(req.params.catId);
  const offset = (page - 1) * pageSize;
  const compId = req?.params?.compId

  const whereClause = {};
  if (!isNaN(compId)) whereClause.compId = compId;
  if (!isNaN(brandId)) whereClause.brandId = brandId;
  if (!isNaN(catId)) whereClause.categoryId = catId;

  try {
    const data = await Product.findAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: db.brand },
        { model: db.category },
        { model: db.company }
      ]
    });


    const totalCount = await Product.count({ where: whereClause });

    res.status(200).send({
      success: true,
      items: data,
      count: totalCount
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};


exports.updateSingleProduct = async (req, res) => {
  try {
    const item = req.body;
    const { id } = req.body;

    await Product.update(item, {
      where: { id: id }
    });

    res.status(200).send({
      success: true,
      message: `Item Updated successfully`,
    });

  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

exports.SingleProductTran = async (req, res) => {
  try {
    let product = await Product.findOne({
      where: { id: req?.params?.id },
      order: [['createdAt', 'DESC']],
      include: [
        { model: db.brand },
        { model: db.category },
        { model: db.company }
      ],
    });

    let tran = await db.saleorder.findAll({
      where: {
        product_id: req?.params?.id
      },
      limit: 12
    })

    res.status(200).send({
      success: true,
      items: tran,
      product: product
    });

  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

exports.searchProduct = async (req, res) => {
  const searchTerm = req.params.name;
  try {
    let data = await Product.findAll({
      where: {
        name: { [Op.like]: `%${searchTerm}%` },
        compId: req?.compId
      },
      include: [
        { model: db.brand },
        { model: db.category }
      ]
    });

    res.status(200).send({
      success: true,
      items: data,
    });

  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

exports.SingleProduct = async (req, res) => {
  try {

    const data = await Product.findOne({
      where: {
        id: req.params?.id
      },
      include: [
        { model: db.brand },
        { model: db.category },
        { model: db.company }
      ]
    });

    res.status(200).send({
      success: true,
      items: data,
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

    const deletedRowsCount = await Product.destroy({ where: { id } });

    if (deletedRowsCount === 0) {
      return res.status(404).send({
        success: false,
        message: "Brand not found."
      });
    }
    deletePhoto(url)
    res.status(200).send({
      success: true,
      message: "Item deleted successfully",
    });

  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};
