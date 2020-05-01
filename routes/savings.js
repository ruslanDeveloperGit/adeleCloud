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
        let currentUser = await User.findOne({ email });

        res.render('savings/index', {
            savings: userSavings,
            user: currentUser
        })
    } catch (e) {
        console.log(e)
    }
})



// new saving 
router.get('/new', async (req, res) => {
    if(res.locals.ejected){ // local for check if user ejected
        return
    }
    let { email } = jwt.decode(req.signedCookies.accessToken)

    const  { friends } = await User.findOne({ email })
    let friendsNames = [];
    for ( let i = 0; i < friends.length; i++ ) {
        console.log(friends[i])
        const { userName } = await User.findOne({ email: friends[i] })
        console.log(userName)
        friendsNames.push(userName)
    }

    res.render('savings/new', {
        friends: friendsNames
    })
})

router.get('/:id', async (req, res) => {
    if ( res.locals.ejected ) {
        return
    }
    try {
        let savingId = req.params.id
        let { email } = jwt.decode(req.signedCookies.accessToken)
        if ( savingId.length < 24) {
            res.send('Invalid id of saving')
        }
        let saving = await Saving.findById(savingId);
        if ( !saving ) {
            res.send('Saving not found')
        }
        let accessingUser = await User.findOne({ email })
        if (!saving.involved.includes(accessingUser.userName) && email !== saving.owner ) {
           
            return res.send('This is a private saving and you don\'t have access to it')
        }
        saving = saving.toObject()
        for (let i = 0; i < saving.files.length; i++) {
                let documentData = saving.files[i].docData;
                documentData = documentData.toString('base64')
               
                documentData = `data:${saving.files[i].docType};base64,${documentData}`
                if (imageTypes.includes(saving.files[i].docType)) {
                    saving.files[i]['isImage'] = true
                }
                // console.log(saving.file[i])
                saving.files[i].docData = documentData
        }
        let { userName} = await User.findOne({ email: saving.owner})
        let ownerName = userName
        if ( email == saving.owner ) ownerName = 'You'
        res.render('savings/savingPage', {
            savingInfo: saving,
            ownerName
        })
    } catch (e) {
        console.error(e)
    }
}) 

// create new saving 
router.post('/', async (req, res) => {
    const {name} = req.body // name of saving
    let files = req.body.files // array of encoded files
    let involved = req.body.involved.trim().split(', ')
    let savingDocuments = [] // all files to save
    let isPrivate = false ; // private saving 
    if (req.body.private) {
        isPrivate = true;
    }

    // updating user obeject
    let { email } = await jwt.decode(req.signedCookies.accessToken);
    let currentUser  = await User.findOne({ email })
    let filesTotalSize = 0
    currentUser.totalSavings += 1
    if ( isPrivate ) {
        currentUser.privateSavings += 1
    } else {
        currentUser.publicSavings += 1
    }

    for (let i = 0; i < files.length; i++) {
        files[i] = JSON.parse(files[i])
        filesTotalSize += files[i].size
        currentUser.totalDocumentsSize += Number(files[i].size)
        let encodedFile = {
            docName: files[i].name,
            docType: files[i].type,
            docSize: files[i].size,
            docData: await new Buffer.from(files[i].data, 'base64')
        }
        savingDocuments.push(new File({...encodedFile}))
    }

    let today = new Date()
    let todayString =  `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}` // getting today in a human readable string

    let saving = new Saving({
        name,
        filesTotalSize,
        involved,
        stringCreateDate: todayString,
        filesAmount: savingDocuments.length,
        owner: email,
        private: isPrivate || false,
        files: savingDocuments

    });
    await currentUser.save()
    await saving.save();
    return res.redirect('/savings');


})


module.exports = router;