const turbo           = require('turbo360')({site_id: process.env.TURBO_APP_ID})
const constants       = require('../constants')
const cartController  = require('./cartController')
const collections     = require('../collections')

const signupGet = (req,res) => {
    // get request for signin screen
    res.render('user/signup')
}

const signupPost = (req, res) => {
    // post request that creates a new user
    const body    = req.body
    const newUser = { username: body.username, email: body.email, password: body.password, role: constants.customer }
    turbo.createUser(newUser)
    .then(data => {

        const cart = {
            user_id: data.id,
            items: [],
            numItems: 0,
            total: 0
        }
        turbo.create( collections.carts, cart )
        .then(cart => {
            res.redirect("/signin")
            return 
        })
        return
    })
    .catch(err => {
        req.vertexSession.msg = { show: true, text: err.message , type:'danger' }
        res.redirect('back')
        return
    })
}

const editUser = (req, res) => {
    // get request for editing the users info. 
}

const updateUser = (req, res) => {
    // post put request that submits the edited data to the data store
}

const signInGet = (req, res) => {
    res.render('user/signin')
}

const signInPost = (req, res) => {
    // post request for logging in the user and adding them to the session
    const credentials = { username: req.body.username, password: req.body.password }
    turbo.login(credentials)
    .then(data => {
        //creates a session for the USER's login.
        const canEdit = (data.role != constants.customer)
        /*if(req.vertexSession == null && req.vertexSession.user == null || req.vertexSession.user == null){
            req.vertexSession.user = { id: data.id, username: data.username, 
                                        email: data.email, loggedIn: true,
                                        notloggedIn:false, canEdit: canEdit
                                    }
        }*/
        req.vertexSession.user = { id: data.id, username: data.username, 
            email: data.email, loggedIn: true,
            notloggedIn:false, canEdit: canEdit
        }
   
        turbo.fetch( collections.carts, { user_id: data.id } )
        .then(result => {
            const cart = {
                id: result[0].id, numItems: result[0].numItems, items: result[0].items ,
                total: result[0].total, user_id: result[0].user_id
            }

            req.vertexSession.cart = cart
            res.redirect("/") 
            return
        })
        return 
    })
    .catch(err => {
        req.vertexSession.msg = { 
                        show: true, text: err.message , type:'danger' 
                                }
        res.redirect('back')
        return
    })
}

const signOut = (req, res) => {
    //resets all session data
    req.vertexSession.user = { id: '', username: '', email:'', loggedIn: false, notloggedIn: true, canEdit:false, role:'' } 
    req.vertexSession.msg  = { show: false, text:'', type:'' }
    req.vertexSession.cart = { user_id:'', items:[], total:0, numItems:0 }
    res.redirect("/")
}

module.exports = {
    signupGet:   signupGet,
    signupPost:  signupPost,
    editUser:    editUser,
    updateUser:  updateUser,
    signInGet:   signInGet,
    signInPost:  signInPost,
    signOut:     signOut   
}