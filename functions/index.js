const constants = require("../constants")

const randomString = (length) => {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

//to protect routes where the user must be authorized to enter
const isAuth = (user) => {
    if( user.id == '' ){
        res.redirect("/")
    }
}

//to protect routes where the user must be an admin to modify something
const isAdmin = (user) => {
    if(user.role == constants.customer ){
        res.redirect("/")
    }
}

//split array into page chunks
const paginationArrays = (arr, chunkSize) => {
    let groups = [], i;
    for (i = 0; i < arr.length; i += chunkSize) {
        groups.push(arr.slice(i, i + chunkSize));
    }
    return groups;
}

const pgLinks = (num, activePg) => {
    activePg++
    //8, 8
    console.log("num: ",num,"activePg: ",activePg)
    let paginationLinks = {}

    if( num > activePg && (activePg - 1) > 0 ){
        paginationLinks.forward  = { class: '', num: activePg + 1 }
        paginationLinks.backward = { class: '', num: activePg -1 } 
    }else if( num > activePg && (activePg - 1) == 0 ){
        paginationLinks.forward  = { class: '', num: activePg + 1 }
        paginationLinks.backward = { class: 'disabled', num: '' } 
    }else if( num < activePg  ){
        paginationLinks.forward  = { class: 'disabled', num: '' }
        paginationLinks.backward = { class: '', num: activePg -1 } 
    }else{
        paginationLinks.forward  = { class: 'disabled', num: '' }
        paginationLinks.backward = { class: 'disabled', num: '' } 
    }


    return paginationLinks
}

module.exports = {
    randomString: randomString,
    isAuth: isAuth,
    isAdmin: isAdmin,
    paginationArrays: paginationArrays,
    pgLinks: pgLinks
}