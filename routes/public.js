const express = require('express');
const router = express.Router();

let Curata = require('../models/curata');
let curataList = require('../models/curataList');
let Template = require('../models/template');
let Component = require('../models/component');
let Entry = require('../models/entry');
let entryComponent = require('../models/entryComponent');
let listItem = require('../models/listItem');
let curataImage = require('../models/image');
let User = require('../models/user');

// Here reside only public Curatas that are also the same when accessed through subdomains



/*====== Curata  ======*/

// Get public Curata
router.get('/:curataId', function(req, res) {

});

// Get Curata list entries entry
router.get('/:curataId/lists', function(req, res) {

});

// Get Curata list entries entry
router.get('/:curataId/lists/:listId', function(req, res) {

});

// Get Curata list entries entry
router.get('/:curataId/lists/:listId/entries', function(req, res) {

});

// Get Curata list entries entry
router.get('/:curataId/lists/:listId/entries/:entryId', function(req, res) {

});



/*====== Access control  ======*/
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    res.redirect('/');
  }
}

module.exports = router;