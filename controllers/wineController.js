const turbo       = require('turbo360')({site_id: process.env.TURBO_APP_ID})
const functions   = require('../functions/index')
const collections = require('../collections/index')
const constants   = require('../constants')
const serverError = "getaddrinfo ENOTFOUND api.turbo360.co api.turbo360.co:443"


const createGet = (req, res) => {
    res.render('wine/create')
}

const createPost = (req, res) => {
    //create a slug so id isn't shown to public
    const data = req.body
    //creates a unique slug for the specific product using it's name and a 5 char randomly generated
    //alphanumerical sequence. 
    let slug = data.name.split(" ").join("+")
    slug = slug+ '+' + functions.randomString(5)
    //the images are stringified on the front end, and here are parsed to turn them into javascript 
    //yet again
    const imgArr = JSON.parse(data.images)
    // creates the wine object that will be added to the 'wines' collection in the data store
    const newWine = {
        name: data.name,
        country: data.country,
        type: data.type,
        description: data.description,
        images: [...imgArr], 
        qty: data.qty,
        slug: slug,
        price: data.price
    }
    turbo.create( collections.wines, newWine)
    .then(data => {
        //replace with show page
        res.redirect(`/wine-${data.slug}`)  
    })
    .catch(err => {
        //return 'back', with error in sessins
        req.vertexSession.msg = { show: true, text: err.message , type:'danger' }
        res.redirect('back')
        return
    })
}

const editGet = (req, res) => {
    //gets the wine using the slug and transfers it to the template
    //where it will be filled in so that an update can be done
    const slug = req.params.slug
    const wine = { slug:slug }

    turbo.fetch( collections.wines, wine )
    .then(data => {
        //this gets the types of wines from the constants folder
        let typesOfWines = constants.typesOfWines
        //this finds the index of the type of wine that corresponds to this particular wine
        const index = typesOfWines.map( w => w.name ).indexOf( data[0].type )
        //this adds a field to the object marking it as selected
        typesOfWines[index].selected = true

        let countries = constants.countries
        const cIndex = countries.map(c => c.name).indexOf( data[0].country )
        countries[cIndex].selected = true
        res.render("wine/edit", { wine: data[0], typesOfWines: typesOfWines, countries: countries })
        return
    })
    .catch(err => {
        //return 'back', with error in sessins
        //redirect back to edit route
        req.vertexSession.msg = { show: true, text: err.message , type:'danger' }
        res.redirect('back')
        return
    })
}

const editPost = (req, res) => {
    const data = req.body
    const slug = req.params.slug

    const newWine = {
        name: data.name,
        country: data.country,
        type: data.type,
        description: data.description,
        qty: data.qty,
        slug: slug,
        price: data.price
    }

    if( data.images.length > 0 ){
        const imgArr = JSON.parse(data.images)
        newWine.images = [...imgArr]
    }
    
    turbo.fetch( collections.wines, { slug: slug } )
    .then(w => {
        turbo.updateEntity(collections.wines ,w[0].id, newWine)
        .then(wine => {
            res.redirect('/wine-'+wine.slug)
            return
        })
        return
    })
    .catch(err => {
        res.status(500).json({
            err: err.message,
            error: true
        })
        return
    })

}

const list = (req, res) => {
    let page

    if( typeof req.query.page == "undefined" || req.query.page == 1 ){
        page = 0
    }else{
        page = req.query.page - 1
    }

    turbo.fetch( collections.wines, null )
    .then(data => {
        const pageData  = functions.paginationArrays(data, 8)
        const pgLinks   = functions.pgLinks(pageData.length, page)
        
        res.render('wine/list', { wines: pageData[page], pgLinks: pgLinks })
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

const show = (req, res) => {
    // search using slug
    const slug  = req.params.slug
    const wine = { slug:slug }

    turbo.fetch( collections.wines, wine )
    .then(data => {
        //this splits the description where ever there is a new line create marked by "\n"
        //in the template this is looped over and each block is placed in its own p tag
        let description = data[0].description
        description = description.split("\n")
        res.render("wine/show", { wine: data[0] , description: description})
        return
    })
    .catch(err => {
        res.status(500).json({
            works: false,
            msg: err.message
        })
        return
    })
    
}


module.exports = {
    createGet:  createGet,
    createPost: createPost,
    editGet:    editGet,
    editPost:   editPost,
    list:       list,
    show:       show

}