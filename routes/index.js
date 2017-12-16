const turbo  = require('turbo360' )({site_id: process.env.TURBO_APP_ID})
const vertex = require('vertex360')({site_id: process.env.TURBO_APP_ID})
const router = vertex.router()

const pagesController = require('../controllers/pagesController')
const userController  = require('../controllers/userController' )
const wineController  = require('../controllers/wineController' )
const cartController  = require('../controllers/cartController' )

const collections = require('../collections')

// Home Route
router.get('/', pagesController.home)

// Users routes
router.get("/signin",  userController.signInGet  )
router.post("/signin", userController.signInPost )

router.get("/signup",  userController.signupGet  )
router.post("/signup", userController.signupPost )

router.get("/signout", userController.signOut    )

// Wine specific routes
router.get("/wine-create", 		wineController.createGet  )
router.post("/wine-create", 	wineController.createPost )
router.get("/wine-:slug", 		wineController.show 	  )
router.get("/edit-wine-:slug", 	wineController.editGet 	  )
router.post("/edit-wine-:slug", wineController.editPost   )
router.get("/wines", 			wineController.list 	  )


 
//cart routes
router.post("/add-to-cart-:slug",   cartController.addToCart )
router.get("/cart"				,   cartController.show )
router.get('/removeFromCart-:slug', cartController.removeFromCart )
router.post("/update-cart",			cartController.updateCart )

//checkout
router.get("/checkout", cartController.checkout)
router.post("/checkout", cartController.checkoutPost)

// purchases
router.get("/purchases", (req, res) => {
	res.status(200).json({
		works: true
	})
})

// experimental route used to test code before use
router.get("/example", (req, res) => {
	const cart = req.vertexSession.cart

	cart.items = []
	cart.total = 0
	cart.numItems = 0
	turbo.updateEntity( collections.carts, cart.id, cart )
	.then(data => {
		req.vertexSession.cart = data
		res.status(200).json({
			cart: data
		})
		return
	})
	.catch(err => {
		res.status(500).json({
			err: err.message
		})
		return
	})
})

// removes the alert from the session variable
router.get("/remover-alert", (req, res) => {
	req.vertexSession.msg =  { show: false, text:'', type:'' }
	console.log('works')
	res.status(200).json({success: true})
})

router.get('*', (req, res) => {
	res.render('general/404')
})

module.exports = router
