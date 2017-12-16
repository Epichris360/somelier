const turbo       = require('turbo360')({site_id: process.env.TURBO_APP_ID})
const collections = require('../collections')
const stripe      = require("stripe")("sk_test_PriIYXaLvWm5L0uTm8fEIr4i");



const addToCart = (req, res) => {
    const slug = req.params.slug
    const data = req.body
    const qty  = data.qty
    const cart = req.vertexSession.cart

    //check to makesure that the same item isn't being added twice
    const result = cart.items.map( i => i.slug ).indexOf(slug)

    if( result > -1 ){
        req.vertexSession.msg = { show: true, text: "The Item is Already In The Cart" , type:'danger' }
        res.redirect('back')
        return
    }

    //end

    turbo.fetch( collections.wines, { slug: slug } )
    .then(data => {
        return data[0]
    })
    .then(wine => {
        const total = qty * wine.price
        cart.total = total
        cart.numItems++
        const itemForCart = {
            id: wine.id, price: wine.price, name: wine.name, type: wine.type, qty: qty, slug: wine.slug, 
            description: wine.description, images: wine.images
        }
        cart.items.push(itemForCart)

        turbo.updateEntity( collections.carts, cart.id, cart )
        .then(data => {
            req.vertexSession.cart = cart
            res.redirect('/cart')
            return
        })
        return
    })
    .catch(err => {
        // send alert saying item was added to cart
        req.vertexSession.msg = { show: true, text: err.message , type:'danger' }
        res.redirect('back')
        return
    })

}

const create = (id) => {
    const cart = {
        user_id: id,
        items: [],
        numItems: 0,
        total: 0
    }
    turbo.create( collections.carts, cart )
    .then(data => {
        return data
    })
    .catch(err => {
        const error = { msg: err.message }
        return error
    })
}

const getCart = (user) => {
    turbo.fetch( collections.carts, { user_id, user_id } )
    .then( data => {
        return data[0]
    })
    .catch(err => {
        const error = { msg: err.message }
        return error
    })
}

const updateCart = ( req, res ) => {
    const ids  = req.body["id[]"]
    const qtys = req.body["qty[]"]
    const cart = req.vertexSession.cart

    if( typeof qtys == "string" ){
        cart.items[0].qty = qtys
    }else{

        for(let x = 0; x < qtys.length ; x++ ){
            cart.items[x].qty = qtys[x]
        }
    }

    const costs = cart.items.map( i => parseInt(i.qty) * parseInt(i.price) )
    const costsTotal  = costs.reduce((a, b) => a + b, 0)
    
    cart.total = costsTotal

    turbo.updateEntity( collections.carts, cart.id, cart )
    .then(data => {
        req.vertexSession.cart = cart
        res.redirect("/cart")
        return
    })
    .catch(err => {
        req.vertexSession.msg = { show: true, text: err.message , type:'danger' }
        res.redirect('back')
        return  
    })
    
}

const show = (req, res) => {
    const cart = req.vertexSession.cart

    const showImg = cart.numItems == 0 

    if(showImg){
        res.render('cart/show',{ cart: cart, showImg: showImg, showCart: !showImg })
    }

    // make shipping a standard of 5$ per item for concepts sake
    // no taxes
    // the below gets an array of qtys from the different wines
    const qtys = cart.items.map( i => parseInt(i.qty) )
    // this sums up the the array of qtys which are numbers using a reduce function 
    const sum  = qtys.reduce((a, b) => a + b, 0)

    //gets total amount of shipping cost. for concepts sake, shipping is a flat $5 per item
    const shipping = sum * 5
    // over all cost is cart.total + shipping
    const totalCost = cart.total + shipping

    res.render('cart/show',{ cart: cart, showImg: showImg, showCart: !showImg, 
        shipping: shipping, totalCost: totalCost
    })
    return
}

const removeFromCart = (req, res) => {
    //gets slug
    const slug = req.params.slug
    //gets cart
    const cart = req.vertexSession.cart
    //gets items from cart. 
    const items = cart.items
    //filters out items that dont have the slug of the item that we want to remove
    //filter() returns a new array that contains the results. thus the new variable being created
    const newItems = items.filter(i => i.slug != slug)
    // assaigns the newItems array to cart.items
    cart.items = newItems

    
    // it number of items == 0 then total =0 and num of items in cart =0
    if(cart.items.length == 0){
        cart.total = 0
        cart.numItems = 0
    }else{
        //else subtract one from itemsNum
        cart.numItems -= 1
        // get total cost of remaing items in cart by using a map function and multiplying
        // price and qty's then use a reduce function to add together the costs
        const costs = cart.items.map( i => parseInt(i.qty) * parseInt(i.price) )
        const costsTotal  = costs.reduce((a, b) => a + b, 0)
        //assign costsTotal to cart total
        cart.total = costsTotal
    }

    turbo.updateEntity( collections.carts, cart.id, cart )
    .then(data => {
        //req.vertexSession.cart = data
        res.redirect("/cart")
        return
    })
    .catch(err => {
        req.vertexSession.msg = { show: true, text: err.message , type:'danger' }
        res.redirect('back')
        return  
    })
}

const checkout = (req, res) => {
    const cart = req.vertexSession.cart

    const qtys = cart.items.map( i => parseInt(i.qty) )
    // this sums up the the array of qtys which are numbers using a reduce function 
    const sum  = qtys.reduce((a, b) => a + b, 0)

    //gets total amount of shipping cost. for concepts sake, shipping is a flat $5 per item
    const shipping = sum * 5
    // over all cost is cart.total + shipping
    const totalCost = cart.total + shipping

    res.render('cart/checkout',{ cart: cart, totalCost: totalCost, shipping: shipping })
}

const checkoutPost = (req, res) => {
    // Token is created using Checkout or Elements!
    // Get the payment token ID submitted by the form:
    var token = request.body.stripeToken; // Using Express

    // Charge the user's card:
    stripe.charges.create({
        amount: 1000,
        currency: "usd",
        description: "Example charge",
        source: token,

        }, 
        function(err, charge) {
        // asynchronously called
    });
}

module.exports = {
    addToCart:      addToCart,
    create:         create,
    getCart:        getCart,
    updateCart:     updateCart,
    show:           show,
    removeFromCart: removeFromCart,
    checkout:       checkout,
    checkoutPost:   checkoutPost
}