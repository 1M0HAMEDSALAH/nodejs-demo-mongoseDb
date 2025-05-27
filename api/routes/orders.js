const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
    res.status(200).json({
        message: "Get orders API",
    });
});

router.post("/", (req, res, next) => {
    const order = {
        productId :req.body.productId,
        quantity: req.body.quantity,
        // price: req.body.price,
    };
    res.status(200).json({
        message: "Post orders API",
        createdOrder: order,
    });
});

router.get("/:orderId", (req, res, next) => {
    const productId = req.params.orderId;
    res.status(200).json({
        message: "You passed a productId",
        productId: productId,
    });
});

router.patch("/:orderId", (req, res, next) => {
    const productId = req.params.orderId;
    res.status(200).json({
        message: "You updated a product",
        productId: productId,
    });
});


router.delete("/:productId", (req, res, next) => {
    const productId = req.params.productId;
    res.status(200).json({
        message: "You deleted a product",
        productId: productId,
    });
});



module.exports = router;