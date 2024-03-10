const fs = require('fs');
const path = require('path');
const stripe = require('stripe')('sk_test_51NffRPEw9Iel7uI7tLcuZt8koT2lG6gBd3qGMHVDKN5F9K6MlCpodGgXoL0vjHb2AT3PP7lEpC0op2tVixtGeq2100u09Ohr28');

const PDFDocument = require('pdfkit')
const Product = require('../models/product');
const Order = require('../models/order');
const Category = require('../models/category');
const Subcategory = require('../models/subcategory');

const ITEMS_PER_PAGE = 2;
exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;
    Product.find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        })
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'Shop',
                path: 'products',
                currentPage: page,
                totalProducts: totalItems,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
        })
      .catch(err => {
          const error =  new Error(err);
          error.httpStatusCode = 500;
          return next(error);
      });;
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
      .catch(err => {
          const error =  new Error(err);
          error.httpStatusCode = 500;
          return next(error);
      });
};

// exports.getIndex = (req, res, next) => {
//     Category.find()
//         .then(categories => {
//         const womenCategoriesPromise = Promise.all(categories
//             .filter(category => category.description === 'Women')
//             .map(category => {
//                 return Subcategory.find({ categoryId: category._id })
//                     .then(subcategories => {
//                         category = category.toObject();
//                         category.subcategories = subcategories;
//                         return category;
//                     });
//             })
//         );
//
//
//         const allCategoriesPromise = Promise.all(categories
//             .filter(category => category.description !== 'Women')
//             .map(category => {
//
//                 return Subcategory.find({ categoryId: category._id })
//                     .then(subcategories => {
//                         category = category.toObject();
//                         if (subcategories) {
//                             category.subcategories = subcategories;
//                         }
//                         return category;
//                     });
//             }));
//
//             const homeCategories = Promise.all(categories
//                 .filter(category => category.description == 'homekit')
//                 .map(category => {
//                     return Subcategory.find({ categoryId: category._id })
//                         .then(subcategories => {
//                             category = category.toObject();
//                             const subcategoriesByDescription = {};
//                             subcategories.forEach(subcategory => {
//                                 const description = subcategory.description;
//                                 if (!subcategoriesByDescription[description]) {
//                                     subcategoriesByDescription[description] = [];
//                                 }
//                                 subcategoriesByDescription[description].push(subcategory);
//                             });
//                             category.items = subcategoriesByDescription;
//                             return category;
//                         });
//                 }));
//
//             return {
//                 womenCategoriesPromise,
//                 allCategoriesPromise,
//                 homeCategories
//             };
//     })
//     .then(categories => {
//         return Promise.all([categories.womenCategoriesPromise, categories.allCategoriesPromise,  categories.homeCategories]);
//     })
//     .then(([womenCategories, allCategories, homeCategories]) => {
//         res.render('index', {
//             path: '/',
//             womenCategories: womenCategories,
//             allCategories: allCategories,
//             homeCategories: homeCategories,
//         });
//     })
//   .catch(err => {
//       const error =  new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//   });
// };


exports.getSinglePage = (req, res, next) => {
    res.render('page-single', {
        path: '/page-single',
    });
};


exports.getCategoryPage = (req, res, next) => {
    res.render('page-category', {
        path: '/page-category',
    });
};

exports.getOfferPage = (req, res, next) => {
    res.render('page-offer', {
        path: '/page-offer',
    });
};

exports.getCartPage = (req, res, next) => {
    res.render('cart', {
        path: '/cart',
    });
};

exports.getCheckout = (req, res, next) => {
    res.render('checkout', {
        path: '/checkout',
    });
};

exports.getIndex = async (req, res, next) => {
    const categories = await getAllCategories();
    const featuredProducts = await getFilteredProducts(true, 'dateCreated','desc', 1);
    const products = await getFilteredProducts(false, 'dateCreated', 'desc', 8);
    const trendingProducts = await getFilteredProducts(false, 'rating','desc',  8);
    console.log(categories[1]);
    res.render('index', {
        path: '/',
        womenCategories: categories[0],
        allCategories: categories[1],
        homeCategories: categories[2],
        prods: products,
        featuredProducts,
        trendingProducts,
    })
    //
    //
    // const page = +req.query.page || 1;
    // let totalItems;
    // Product.find()
    //     .countDocuments()
    //     .then(numProducts => {
    //         totalItems = numProducts;
    //         return Product.find()
    //             .skip((page - 1) * ITEMS_PER_PAGE)
    //             .limit(ITEMS_PER_PAGE)
    //     })
    //     .then(products => {
    //         res.render('index', {
    //             prods: products,
    //             pageTitle: 'Shop',
    //             path: '/',
    //             currentPage: page,
    //             totalProducts: totalItems,
    //             hasNextPage: ITEMS_PER_PAGE * page < totalItems,
    //             hasPreviousPage: page > 1,
    //             nextPage: page + 1,
    //             previousPage: page - 1,
    //             lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
    //         });
    //     })
    //     .catch(err => {
    //         const error =  new Error(err);
    //         error.httpStatusCode = 500;
    //         return next(error);
    //     });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
      .catch(err => {
          const error =  new Error(err);
          error.httpStatusCode = 500;
          return next(error);
      });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    })
      .catch(err => {
          const error =  new Error(err);
          error.httpStatusCode = 500;
          return next(error);
      });;
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
      .catch(err => {
          const error =  new Error(err);
          error.httpStatusCode = 500;
          return next(error);
      });
};

// exports.getCheckout = (req, res, next) => {
//     let products;
//     let total = 0;
//     req.user
//         .populate('cart.items.productId')
//         .execPopulate()
//         .then(async(user) => {
//             products = user.cart.items;
//             total = 0;
//             let stripeCheckoutData = [];
//             for (let product of products) {
//                 total += product.quantity * product.productId.price;
//                 let stripProduct = await stripe.products.create({
//                     name: product.productId.title,
//                     description: product.productId.description
//                 })
//                 const stripePrice = await stripe.prices.create({
//                     product: stripProduct.id,
//                     unit_amount: product.productId.price*100,
//                     currency: 'usd',
//                 });
//                 stripeCheckoutData.push({
//                     price: stripePrice.id,
//                     quantity: product.quantity
//                 })
//             }
//             return  await stripe.checkout.sessions.create({
//                 line_items: stripeCheckoutData,
//                 mode: 'payment',
//                 success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
//                 cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
//             });
//         })
//         .then(session => {
//             res.render('shop/checkout', {
//                 path: '/checkout',
//                 pageTitle: 'Checkout',
//                 products: products,
//                 totalSum: total,
//                 sessionId: session.id
//             });
//         })
//         .catch(err => {
//             console.log(err);
//             const error = new Error(err);
//             error.httpStatusCode = 500;
//             return next(error);
//         });
// };

exports.getCheckoutSuccess = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(i => {
                return { quantity: i.quantity, product: { ...i.productId._doc } };
            });
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user
                },
                products: products
            });
            return order.save();
        })
        .then(result => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => {
            const error =  new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};
exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
      .catch(err => {
          const error =  new Error(err);
          error.httpStatusCode = 500;
          return next(error);
      });
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
      .catch(err => {
          const error =  new Error(err);
          error.httpStatusCode = 500;
          return next(error);
      });
};

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId)
        .then(order => {
            if(!order){
                return next(new Error('No order found.'));
            }
            if(order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error('Unauthorized.'));
            }
            const invoiceName = 'invoice-' + orderId + '.pdf';
            const invoicePath = path.join('data', 'invoices', invoiceName);
            const pdfDoc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                'inline; filename="'+ invoiceName + '"'
            );
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);

            pdfDoc.fontSize(26).text('Invoice', {
                underline: true
            })
            pdfDoc.text('---------------------------------');
            let totalPrice = 0;
            order.products.forEach(prod => {
                totalPrice += prod.quantity * prod.product.price;
                console.log(prod.product);
                pdfDoc.fontSize(14).text(prod.product.title + ' - ' + prod.quantity + ' x ' + '$' + prod.product.price)
            });
            pdfDoc.text('---------------------------------');
            pdfDoc.fontSize(20).text('Total Price: $' + totalPrice)
            pdfDoc.end();
            // fs.readFile(invoicePath, (err, data) => {
            //     if (err) {
            //         return next(err);
            //     }
            //     res.setHeader('Content-Type', 'application/pdf');
            //     res.setHeader('Content-Disposition', 'inline; filename="'+ invoiceName + '"');
            //     res.send(data);
            // });

            // const file = fs.createReadStream((invoicePath));
            //
            // file.pipe(res);
        })
        .catch(err => console.log(err))
}

function getAllCategories() {
    return Category.find()
        .then(categories => {
            const womenCategoriesPromise = Promise.all(categories
                .filter(category => category.description === 'Women')
                .map(category => {
                    return Subcategory.find({ categoryId: category._id })
                        .then(subcategories => {
                            if (subcategories.length > 0) {
                                category.subcategories = subcategories;
                            }
                            return category;
                        });
                })
            );

            const allCategoriesPromise = Promise.all(categories
                .filter(category => category.description !== 'Women')
                .map(category => {
                    return Subcategory.find({ categoryId: category._id })
                        .then(subcategories => {
                            if (subcategories.length > 0) {
                                category.subcategories = subcategories;
                            }
                            return category;
                        });
                }));

            const homeCategoriesPromise = Promise.all(categories
                .filter(category => category.description === 'homekit')
                .map(category => {
                    return Subcategory.find({ categoryId: category._id })
                        .then(subcategories => {
                            if (subcategories.length > 0) {
                                const subcategoriesByDescription = {};
                                subcategories.forEach(subcategory => {
                                    const description = subcategory.description;
                                    if (!subcategoriesByDescription[description]) {
                                        subcategoriesByDescription[description] = [];
                                    }
                                    subcategoriesByDescription[description].push(subcategory);
                                });
                                const updatedCategory = {
                                    ...category.toObject(),
                                    items: subcategoriesByDescription
                                };
                                return updatedCategory;
                            } else {
                                return category.toObject();
                            }
                        });
                }));
            return Promise.all([womenCategoriesPromise, allCategoriesPromise, homeCategoriesPromise]);
        });
}

function getAllProducts() {
    return Product.find({ isFeatured: false }).limit(8).sort({dateCreated: 'desc' }).then(products => {
        const productPromises = products.map(product => {
            let discountedProduct = product.price;
            let IsDiscountedProduct = false;
            const offerEnds = calculateOffersAndDate(product.discount_expired_date);
            if(product.discount != null){
                discountedProduct = (product.price - ((product.price * product.discount) / 100)).toFixed(2);
                IsDiscountedProduct = true
            }
            return Promise.resolve({
                id: product._id,
                title: product.title,
                price: product.price,
                changedPrice: discountedProduct,
                description: product.description,
                discount: discountedProduct,
                stock: product.stock,
                sold: product.sold,
                offerEnds,
                image:product.image,
                discount_expired_date:product.discount_expired_date,
            });
        });
        return Promise.all(productPromises);
    });
}

function getFilteredProducts(filter, orderedColumn, order, limit) {
    return Product.find({ isFeatured: filter }).limit(limit).sort({[orderedColumn]: order }).then(products => {
        const productPromises = products.map(product => {
            let discountedProduct = product.price;
            let IsDiscountedProduct = false;
            const offerEnds = calculateOffersAndDate(product.discount_expired_date);
            if(product.discount != null){
                discountedProduct = (product.price - ((product.price * product.discount) / 100)).toFixed(2);
                IsDiscountedProduct = true
            }
            return Promise.resolve({
                id: product._id,
                title: product.title,
                price: product.price,
                changedPrice: discountedProduct,
                description: product.description,
                discount: discountedProduct,
                stock: product.stock,
                sold: product.sold,
                offerEnds,
                image:product.image,
                discount_expired_date:product.discount_expired_date,
                numReviews: product.numReviews
            });
        });
        return Promise.all(productPromises);
    });
}

function calculateOffersAndDate(offerEnds){
    const currentDate = new Date();
    const remainingTimeMs = offerEnds - currentDate;
    const seconds = Math.floor((remainingTimeMs / 1000) % 60);
    const minutes = Math.floor((remainingTimeMs / (1000 * 60)) % 60);
    const hours = Math.floor((remainingTimeMs / (1000 * 60 * 60)) % 24);
    const days = Math.floor(remainingTimeMs / (1000 * 60 * 60 * 24));
    return [days, hours, minutes, seconds]
}