const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth')

const Review = require('../models/Review')

// @desc Show add page
// @route GET /reviews/add
router.get('/add', ensureAuth, (req, res) => {
    res.render('reviews/add') 
})
  
  module.exports = router