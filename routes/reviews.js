const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth')

const Review = require('../models/Review')


router.get('/add', ensureAuth, (req, res) => {
    res.render('reviews/add') 
})


router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id
    await Review.create(req.body)
    res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})


router.get('/', ensureAuth, async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'public' })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean()

    res.render('reviews/index', {
      reviews,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})


router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let review = await Review.findById(req.params.id)
    .populate('user')
    .lean()

    if (!review) {
      return res.render('error/404')
    }

    if (review.user._id != req.user.id && review.status == 'private') {
      res.render('error/404')
    } else {
      res.render('reviews/show', {
      review,
      })
    }
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
})


router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
    }).lean()

    if (!review) {
      return res.render('error/404')
    }

    if (review.user != req.user.id) {
      res.redirect('/reviews')
    } else {
      res.render('reviews/edit', {
        review,
      })
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})


router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let review = await Review.findById(req.params.id).lean()

    if (!review) {
      return res.render('error/404')
    }

    if (review.user != req.user.id) {
      res.redirect('/reviews')
    } else {
      review = await Review.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      })

      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})


router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let review = await Review.findById(req.params.id).lean()

    if (!review) {
      return res.render('error/404')
    }

    if (review.user != req.user.id) {
      res.redirect('/reviews')
    } else {
      await Review.remove({ _id: req.params.id })
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})


router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const reviews = await Review.find({
      user: req.params.userId,
      status: 'public',
    })
      .populate('user')
      .lean()

    res.render('reviews/index', {
      reviews,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

module.exports = router