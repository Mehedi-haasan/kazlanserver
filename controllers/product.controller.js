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
        compId: req.body.compId ? req.body.compId : req.compId,
        categoryId: req.body.categoryId,
        editionId: req.body.editionId,
        brandId: req.body.brandId,
        active: true
      }
    })

    if (data) {
      return res.status(200).send({
        success: true,
        message: "Product already exist"
      })
    }

    await Product.create({
      active: true,
      product_type: req.body.product_type,
      categoryId: req.body.categoryId,
      editionId: req.body.editionId,
      code: req.body.code,
      compId: req.body.compId ? req.body.compId : req.compId,
      supplier: req.body.supplier,
      name: req.body.name,
      description: req.body.description,
      image_url: req.body.image_url,
      cost: req.body.cost,
      price: req.body.price,
      edition: req.body.edition,
      year: req.body.year,
      brandId: req.body.brandId,
      createdby: req.userId,
      creator: req.user,
      qty: req.body.qty,
      qty_type: req.body.qty_type,
      discount: req.body.discount,
      discount_type: req.body.discount_type
    })


    return res.status(200).send({
      success: true,
      message: "Item Created Successfully"
    })

  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }

}

exports.getProductTemplete = async (req, res) => {
  const page = parseInt(req.params.page) || 1;
  const pageSize = parseInt(req.params.pageSize) || 10;
  const brandId = parseInt(req.params.brandId);
  const catId = parseInt(req.params.catId);
  const offset = (page - 1) * pageSize;
  const compId = req.params.compId ? req.params.compId : req?.compId

  const whereClause = {};
  whereClause['active'] = true
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

    return res.status(200).send({
      success: true,
      items: data,
      count: totalCount
    });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};


exports.updateSingleProduct = async (req, res) => {
  try {
    const item = req.body;
    const { id } = req.body;

    await Product.update(item, {
      where: { id: id }
    });

    return res.status(200).send({
      success: true,
      message: `Item Updated successfully`,
    });

  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
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

    return res.status(200).send({
      success: true,
      items: tran,
      product: product
    });

  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
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

    return res.status(200).send({
      success: true,
      items: data,
    });

  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};


exports.SecondSearchProduct = async (req, res) => {

  let condition = {
    compId: req?.compId,
  };


  const isValid = (value) => value !== undefined && value !== null && value !== "null" && value !== "undefined";

  if (isValid(req.params.name)) {
    condition.name = { [Op.like]: `%${req.params.name}%` };
  }

  if (isValid(req.params.brand)) {
    condition.brandId = parseInt(req.params.brand);
  }

  if (isValid(req.params.edition)) {
    condition.editionId = parseInt(req.params.edition);
  }

  if (isValid(req.params.category)) {
    condition.categoryId = parseInt(req.params.category);
  }



  try {
    let data = await Product.findAll({
      where: condition,
      include: [
        { model: db.brand },
        { model: db.category }
      ]
    });

    return res.status(200).send({
      success: true,
      items: data,
    });

  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
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
        { model: db.customer },
        { model: db.company }
      ]
    });

    return res.status(200).send({
      success: true,
      items: data,
    });

  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
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

    return res.status(200).send({
      success: true,
      items: data,
    });

  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
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
    return res.status(200).send({
      success: true,
      message: "Item deleted successfully",
    });

  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};


exports.BulkUpdate = async (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided for update."
      });
    }


    for (const item of data) {
      if (!item.id) continue;

      await Product.update(
        { active: item.active }, // ✅ Only update `active` field
        { where: { id: item.id } }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Products updated successfully."
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



exports.BulkGetProduct = async (req, res) => {
  try {
    const page = parseInt(req.params.page);
    const pageSize = parseInt(req.params.pageSize);
    const offset = (page - 1) * pageSize;

    let allProduct = await Product.findAll({
      limit: pageSize,
      offset: offset,
    })

    return res.status(200).json({
      success: true,
      items: allProduct
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.BulkCreate = async (req, res) => {
  try {
    let { data } = req.body

    let allProduct = await Product.bulkCreate(data);

    return res.status(200).json({
      success: true,
      message: "Updated Successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};