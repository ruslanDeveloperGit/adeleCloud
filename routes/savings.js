const { Router } = require('express');
const router = Router();

// db model
const Saving = require('../models/SavingModel')
const File = require('../models/FileSchema')
// all user savings 
router.get('/', async (req, res) => {
    try{
        res.render('savings/index')
    } catch (e) {

    }
})

// new saving 
router.get('/new', (req, res) => {
    res.render('savings/new')
})

// create new saving 
router.post('/', async (req, res) => {
    const {name} = req.body // name of saving
    let files = req.body.files // array of encoded files
    let isPrivate; // private saving 
    let savingDocuments = []
    for (let i = 0; i < files.length; i++) {
        files[i] = JSON.parse(files[i])
        let encodedFile = {
            docName: files[i].name,
            docType: files[i].type,
            docSize: files[i].size,
            docData: await new Buffer.from(files[i].data, 'base64')
        }
        savingDocuments.push(new File({...encodedFile}))
    }
    if (req.body.private) {
        isPrivate = true;
    }
    let saving = new Saving({
        name,
        private: isPrivate || false,
        files: savingDocuments

    });
    await saving.save();
    return res.redirect('/savings');


})


module.exports = router;