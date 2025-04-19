const { where } = require("sequelize");
const db = require("../models");
const Product = db.product;
const Customer = db.customer;
const Op = db.Sequelize.Op;
const deletePhoto = require('./filedelete.controller')


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
      message: `Updated successfully`,
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
  const searchTerm = req.params.product;
  try {
    let data = await Product.findAll({
      where: {
        name: { [Op.like]: `%${searchTerm}%` },
        compId: req?.compId
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

exports.UpdateProduct = async (req, res) => {
  const { allData, balance, userId } = req.body;


  try {

    for (const pro of allData) {
      const product = await Product.findOne({
        where: { id: pro?.id },
      });

      if (product) {
        await Product.update(
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

    const user = await Customer.findOne({ where: { id: userId } });

    if (user) {
      await Customer.update(
        { balance: user.balance + parseInt(balance) },
        { where: { id: userId } }
      );
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
      message: "Brand deleted successfully.",
    });

  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};
