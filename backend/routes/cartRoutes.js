const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const {protect} = require('../middleware/authMiddleware');

const router = express.Router();


//Function to get the cart for a user or guest
const getCart = async (userId, guestId) => {
    
    if (userId) {
        return await Cart.findOne({user: userId});
    } else if (guestId) {
        return await Cart.findOne({guestId: guestId});
    }
    return null;
    
}


//@route POST /api/cart
//@desc Add product to cart for a guest or logged in user
//@access Public

router.post("/", async (req, res) => {
    const { productId, quantity, size, color, guestId, userId } = req.body;
    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({message: "Product not found"});
        }
        //Determine if user is logged in or guest
        let cart = await getCart(userId, guestId);

        //if cart exists, update it
        if (cart) {
            const productIndex = cart.products.findIndex(
                (p) => 
                    p.productId.toString() === productId &&
                    p.size === size && p.color === color
            );

            if (productIndex > -1) {
                //Product already exists in the cart, update quantity
                cart.products[productIndex].quantity += quantity;
            } else {
                //Product does not exist in the cart, add it
                cart.products.push({
                    productId,
                    name: product.name,
                    image: product.images[0].url,
                    price: product.price,
                    size,
                    color,
                    quantity,
                });
            }

            //Recalculate total price
            cart.totalPrice = cart.products.reduce(
                (acc, item) => acc + item.price * item.quantity,
                0
            );

            await cart.save();
            return res.status(200).json(cart);

        } else {
            //Create a new cart
            const newCart = await Cart.create({
                user: userId ? userId : undefined,
                guestId: guestId ? guestId : "guest_" + new Date().getTime(),
                products: [
                    {
                        productId,
                        name: product.name,
                        image: product.images[0].url,
                        price: product.price,
                        size,
                        color,
                        quantity,
                    }
                ],
                totalPrice: product.price * quantity,

            });
            return res.status(201).json(newCart);
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error"});
        
    }
});

//@route PUT /api/cart
//@desc Update product quantity in cart for a guest or logged in user
//@access Public

router.put("/", async (req, res) => {
    const { productId, quantity, size, color, guestId, userId } = req.body;
    try {
        let cart = await getCart(userId, guestId);

        if (!cart) {
            return res.status(404).json({message: "Cart not found"});
        }

        const productIndex = cart.products.findIndex(
            (p) => 
                p.productId.toString() === productId &&
                p.size === size && p.color === color
        );

        if (productIndex > -1) {
            //Product already exists in the cart, update quantity
            if( quantity > 0) {
                cart.products[productIndex].quantity = quantity;
            } else {
                //Remove the product from the cart
                cart.products.splice(productIndex, 1);
            }

            cart.totalPrice = cart.products.reduce(
                (acc, item) => acc + item.price * item.quantity,
                0
            );

            await cart.save();
            return res.status(200).json(cart);
        } else {
            return res.status(404).json({message: "Product not found in cart"});
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error"});
    }
});


// @route DELETE /api/cart
// @desc Remove a product from the cart
// @access Public
router.delete("/", async (req, res) => {
    const { productId, size, color, guestId, userId } = req.body;
    try {
        let cart = await getCart(userId, guestId);

        if (!cart) {
            return res.status(404).json({message: "Cart not found"});
        }

        const productIndex = cart.products.findIndex(
            (p) => 
                p.productId.toString() === productId &&
                p.size === size && p.color === color
        );

        if (productIndex > -1) {
            cart.products.splice(productIndex, 1);

            cart.totalPrice = cart.products.reduce(
                (acc, item) => acc + item.price * item.quantity,
                0
            );

            await cart.save();
            return res.status(200).json(cart);
        } else {
            return res.status(404).json({message: "Product not found in cart"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error"});
        
    }
});

// @route GET /api/cart
// @desc Get the cart for a user or guest
// @access Public
router.get("/", async (req, res) => {
    const { guestId, userId } = req.query;
    try {
        const cart = await getCart(userId, guestId);
        if (cart) {
            return res.json(cart);
        } else {
            return res.status(404).json({message: "Cart not found"});
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error"});
        
    }
});

// @route POST /api/cart/merge
// @desc Merge guest cart with user cart on login
// @access Private
router.post("/merge", protect, async (req, res) => {
    const { guestId } = req.body;
    try {
        //Find the guest cart and user cart
        const guestCart = await Cart.findOne({guestId});
        const userCart = await Cart.findOne({user: req.user._id});

        if(guestCart) {
            if(guestCart.products.length === 0) {
                return res.status(400).json({message: "Guest cart is empty"});
            }

            if(userCart) {
                //Merge the guest cart with the user cart
                guestCart.products.forEach((guestItem) => {
                    const productIndex = userCart.products.findIndex(
                        (item) => 
                            item.productId.toString() === guestItem.productId.toString() &&
                            item.size === guestItem.size && item.color === guestItem.color
                    );

                    if(productIndex > -1) {
                        //If the items exists in the cart update the quantity
                        userCart.products[productIndex].quantity += guestItem.quantity;
                    } else {
                        //If the item does not exist in the cart add it
                        userCart.products.push(guestItem);
                    }
                });

                userCart.totalPrice = userCart.products.reduce(
                    (acc, item) => acc + item.price * item.quantity,
                    0
                );

                await userCart.save();
                //Remove guest cart after merging
                try {
                    await Cart.findOneAndDelete({guestId});
                    
                } catch (error) {
                    console.error( "Error deleting guest cart" ,error);
                }
                return res.status(200).json(userCart);
            } else {
                //if user has no existing cart assign the guest cart to the user
                guestCart.user = req.user._id;
                guestCart.guestId = undefined;
                await guestCart.save();

                return res.status(200).json(guestCart);
            }
        } else {
            if(userCart) {
                //Guest cart has already been merged return the user cart
                return res.status(200).json(userCart);
            }
            return res.status(404).json({message: "Guest Cart not found"});
        }
        
    } catch (error) {
        console.error(error);
        error.status(500).json({message: "Server Error"});
        
    }
});


module.exports = router;