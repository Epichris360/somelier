const turbo           = require('turbo360')({site_id: process.env.TURBO_APP_ID})
const constants       = require('../constants')
const collections     = require('../collections')
const functions       = require('../functions')

const getCreate  = (req, res) => {
    res.render('events/create')
}

const postCreate = (req, res) => {

}

const show       = (req, res) => {

}

const getEdit    = (req, res) => {

}

const postEdit   = (req, res) => {

}

const list      = (req, res) => {

}

const disableEvent = (req, res) => {

}

module.exports = {
    getCreate:    getCreate,
    postCreate:   postCreate,
    show:         show,
    getEdit:      getEdit,
    postEdit:     postCreate,
    list:         list,
    disableEvent: disableEvent
}