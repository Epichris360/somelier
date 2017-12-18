const turbo           = require('turbo360')({site_id: process.env.TURBO_APP_ID})
const constants       = require('../constants')
const collections     = require('../collections')
const functions       = require('../functions')

const getCreate  = (req, res) => {
    res.render('blog/create')
}

const postCreate = (req, res) => {
    //create a slug so id isn't shown to public
    const data  = req.body
    //creates a unique slug for the specific product using it's name and a 5 char randomly generated
    //alphanumerical sequence. 
    let slug     = data.title.split(" ").join("+")
    slug = slug + '+' + functions.randomString(5)
    //get the image
    const imgArr = JSON.parse(data.image)
    //creates the a new blog post object
    const newPost = {
        title: data.title, post: data.post, image: imgArr[0], slug: slug, 
        created_at: new Date(), updated_at: new Date()
    }
    // adds the new object to the datastore
    turbo.create( collections.blogs, newPost )
    .then(data => {
        res.render(`/blog-${data.slug}`)
        return
    })
    .catch(err => {
        req.vertexSession.msg = { show: true, text: err.message , type:'danger' }
        res.redirect('back')
        return
    })
}

const show       = (req, res) => {
    const slug = req.params.slug
    turbo.fetch( collections.post, { slug: slug } )
    .then(data => {
        res.render('blog/show',{ blog: data[0] })
        return
    })
    .catch(err => {
        req.vertexSession.msg = { show: true, text: err.message , type:'danger' }
        res.redirect('back')
        return
    })
}

const getEdit    = (req, res) => {
    const slug = req.params.slug
    
    turbo.fetch( collections.blogs, { slug: slug } )
    .then(data => {
        res.render('blog/edit',{ blog: data[0]})
        return
    })
    .catch(err => {
        req.vertexSession.msg = { show: true, text: err.message , type:'danger' }
        res.redirect('back')
        return
    })
}

const postEdit   = (req, res) => {

}

const list       = (req, res) => {
    let page

    if( typeof req.query.page == "undefined" || req.query.page == 1 ){
        page = 0
    }else{
        page = req.query.page - 1
    }
    turbo.fetch( collections.post, null )
    .then(data => {
        const pageData  = functions.paginationArrays(data, 6)
        const pgLinks   = functions.pgLinks(pageData.length, page)
        res.render("blog/list", { blogs: pageData[page], pgLinks: pgLinks })
        return
    }) 
    .catch(err => {
        res.status(500).json({
            status: false,
            msg: err.message
        })
        return
    })
}



module.exports = {
    getCreate:  getCreate,
    postCreate: postCreate,
    getEdit:    getEdit,
    postEdit:   postEdit,
    list:       list,
    show:       show
}