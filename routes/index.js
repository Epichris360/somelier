const turbo  = require('turbo360' )({site_id: process.env.TURBO_APP_ID})
const vertex = require('vertex360')({site_id: process.env.TURBO_APP_ID})
const router = vertex.router()

const pagesController = require('../controllers/pagesController')
const userController  = require('../controllers/userController' )
const wineController  = require('../controllers/wineController' )
const cartController  = require('../controllers/cartController' )
const blogController  = require('../controllers/blogController' )
const eventController = require('../controllers/eventController')

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
router.post("/add-to-cart-:slug",   cartController.addToCart  	  )
router.get("/cart"				,   cartController.show 		  )
router.get('/removeFromCart-:slug', cartController.removeFromCart )
router.post("/update-cart",			cartController.updateCart 	  )

//checkout
router.get("/checkout",  cartController.checkout	 )
router.post("/checkout", cartController.checkoutPost )

// blogs routes
// blog creation etc is done in the dashboard
router.get("/blogs",	  blogController.list )
router.get("/blog-:slug", blogController.show )

// events routes go here
router.get('/event-create', eventController.getCreate )


//
router.get("/date", function(req, res){
	res.render('date')
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
