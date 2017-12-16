const turbo           = require('turbo360')({site_id: process.env.TURBO_APP_ID})
const collections     = require('../collections')

const home = (req, res) => {
    res.render('index')
}

module.exports = {
    home: home
}