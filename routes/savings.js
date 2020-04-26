const { Router } = require('express');
const router = Router();

// db model
const Saving = require('../models/SavingModel')

// all user savings 
router.get('/', (req, res) => {
    res.render('savings/index')
})

// new saving 
router.get('/new', (req, res) => {
    res.render('savings/new')
})

// create new saving 
router.post('/', (req, res) => {
    console.log(req.body)
})

module.exports = router;