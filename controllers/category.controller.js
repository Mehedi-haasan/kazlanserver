const db = require("../models");
const Category = db.category;
const deletePhoto = require('./filedelete.controller')
const Op = db.Sequelize.Op;



exports.getCategory = async (req, res) => {
    const page = parseInt(req.params.page) || 1;
    const pageSize = parseInt(req.params.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    try {
        let data = await Category.findAll({
            limit: pageSize,
            where: { compId: req.compId, active: true },
            offset: offset
        })

        const totalCount = await Category.count({ where: { compId: req.compId } });

        return res.status(200).send({
            success: true,
            items: data,
            count: totalCount
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}


exports.getCategoryAll = async (req, res) => {

    try {
        let data = await Category.findAll({
            attributes: ['id', 'name', 'image_url'],
            where: { compId: req.compId, active: true },
        })
        return res.status(200).send({
            success: true,
            items: data
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}



exports.getCategoryByProduct = async (req, res) => {
    // try {
    //     const products = await ProductTemplate.findAll({
    //         attributes: ['id', 'name', 'image_url', 'description', 'price'],
    //         include: [
    //             {
    //                 model: ProductCategory,
    //                 attributes: ['id', 'name'], // Include id attribute for ProductCategory
    //             },
    //         ],
    //     });

    //     // Group products by category
    //     const groupedProducts = products.reduce((acc, product) => {
    //         const category = product.product_category.name; // Assuming category association is properly defined
    //         if (!acc[category]) {
    //             acc[category] = [];
    //         }
    //         acc[category].push(product);
    //         return acc;
    //     }, {});

    //     // Convert groupedProducts object to array of objects
    //     const result = Object.keys(groupedProducts).map(category => ({
    //         id: groupedProducts[category][0].product_category.id, // Assuming each category has the same id for all products in it
    //         name: category,
    //         value: groupedProducts[category]
    //     }));

    //     res.status(200).send({
    //         success: true,
    //         items: result
    //     });
    // } catch (error) {
    //     console.error('Error fetching products by category:', error);
    //     res.status(500).send({ success: false, message: error.message });
    // }
};




exports.CreateCategory = async (req, res) => {
    try {
        const data = await Category.findOne({
            where: {
                name: req.body.name,
                compId: req.body.compId ? req.body.compId : req.compId
            }
        })

        if (data) {
            return res.status(200).send({
                success: true,
                message: "Category already exist"
            })
        }
        await Category.create({
            active: true,
            name: req.body.name,
            image_url: req.body.image_url,
            createdby: req.userId,
            compId: req.compId,
            creator: req.user
        });

        return res.status(200).send({
            success: true,
            message: "Category Created Successfully"
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }

}


exports.updateCategory = async (req, res) => {
    try {
        const { id, name, image_url, url } = req.body;

        if (!id) {
            return res.status(400).send({
                success: false,
                message: "Order ID and status are required."
            });
        }


        const [updatedRowsCount] = await Category.update(
            { name: name, image_url: image_url, creator: req.user },
            { where: { id: id } }
        );

        if (updatedRowsCount === 0) {
            return res.status(404).send({
                success: false,
                message: "Order not found or status is already the same."
            });
        }
        if (url) {
            deletePhoto(url)
        }
        return res.status(200).send({
            success: true,
            message: `Category Updated successfully`,
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}


exports.SearchCategory = async (req, res) => {
    const searchTerm = req.params.name;
    try {
        let data = await Category.findAll({
            where: {
                name: { [Op.like]: `%${searchTerm}%` },
                compId: req?.compId,
                active: true
            }
        });

        return res.status(200).send({
            success: true,
            items: data,
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}


exports.DeleteCategory = async (req, res) => {
    const { id } = req.body;
    try {
        await Category.update(
            {
                active: false,
                name: req.body.name,
                image_url: req.body.image_url,
                createdby: req.userId,
                compId: req.compId,
                creator: req.user
            },
            {
                where: {
                    id: id
                }
            }
        );
        // deletePhoto(url)
        return res.status(200).send({
            success: true,
            message: "Category Deleted Successfully"
        })

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }

}