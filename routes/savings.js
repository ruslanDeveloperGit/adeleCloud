const { Router } = require('express');
const router = Router();
const jwt = require('jsonwebtoken')
let imageTypes = ['image/jpeg', 'image/png', 'image/jpg']
// db model
const Saving = require('../models/SavingModel')
const File = require('../models/FileSchema')
const User = require('../models/UserModel')
// all user savings 
router.get('/', async (req, res) => {
    if(res.locals.ejected){ // local for check if user ejected
        return
    }
    try{
        let { accessToken } = req.signedCookies;
        let { email } = jwt.decode(accessToken)
        let userSavings = await Saving.find({ owner: email });
        let currentUser = await User.findOne({ email })
        res.render('savings/index', {
            savings: userSavings,
            user: currentUser
        })
    } catch (e) {
        console.log(e)
    }
})

// new saving 
router.get('/new', (req, res) => {
    if(res.locals.ejected){ // local for check if user ejected
        return
    }
    res.render('savings/new')
})

// create new saving 
router.post('/', async (req, res) => {
    const {name} = req.body // name of saving
    let { accessToken } = req.signedCookies;
    let { email } = jwt.decode(accessToken)
    let files = req.body.files // array of encoded files
    let isPrivate; // private saving 
    let savingDocuments = []

    // updating user obeject
    let duringUser = await User.findOne({ email })
    duringUser.totalSavings += 1

    for (let i = 0; i < files.length; i++) {
        files[i] = JSON.parse(files[i])
        console.log(files[i].type)
        duringUser.totalDocumentsSize += Number(files[i].size)
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
    let today = new Date()
    let todayString =  `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}` // getting today in a human readable string

    let saving = new Saving({
        name,
        stringCreateDate: todayString,
        filesAmount: savingDocuments.length,
        owner: email,
        private: isPrivate || false,
        files: savingDocuments

    });
    await duringUser.save()
    await saving.save();
    return res.redirect('/savings');


})



module.exports = router;