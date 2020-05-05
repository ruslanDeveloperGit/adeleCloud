const { Router } = require('express');
const router = Router();
const jwt = require('jsonwebtoken')
const uniqid = require('uniqid')

const imageTypes = ['image/png', 'image/jpeg', 'image/jpg']
// db model
const Saving = require('../models/SavingModel')
const File = require('../models/FileSchema')
const User = require('../models/UserModel')

const { verifyToken } = require('../helpers/tokenVerify')

// all user savings 
router.get('/', verifyToken, async (req, res, next) => {
    if(res.locals.ejected){ // local for check if user ejected
        return
    }
    try{
        let { accessToken } = req.signedCookies;
        let { id } = jwt.decode(accessToken)
        let userSavings = await Saving.find({ owner: { profileId : id} });
        let currentUser = await User.findOne({ profileId: id });

        res.render('savings/index', {
            savings: userSavings,
            user: currentUser
        })
    } catch (e) {
        console.log(e)
    }
})



// new saving 
router.get('/new', verifyToken, async (req, res, next) => {
    if(res.locals.ejected){ // local for check if user ejected
        return
    }
    let { id } = jwt.decode(req.signedCookies.accessToken)

    res.render('savings/new', {
        id,
    })
})

router.get('/:id/', async ( req, res ) => {

    let savingId = req.params.id
    let email;
    const { id } = jwt.decode(req.signedCookies.accessToken)


    if (!savingId.startsWith('save_')) {
        return res.send('Invalid id of saving')
    }
    let saving = await Saving.findOne({ savingId }) 
    if ( !saving ) {
        return res.send('Saving not found')
    }
    
   
    // updating user obeject
    if( req.signedCookies.accessToken ) {  
        email  = jwt.decode(req.signedCookies.accessToken).email

    }
    if ( saving.private ) {
        if(!email) return res.send('You have to authorize to see this saving.')

        let accessingUser = await User.findOne({ email })
    
        let isInvolved = !!saving.involved.find((user) => {
            return user.profileId == accessingUser.profileId
        })
       
        if (!isInvolved && id !== saving.owner.profileId ) {  
            return res.send('This is a private saving and you don\'t have access to it')
        }
    }
    saving = saving.toObject()
    for (let i = 0; i < saving.files.length; i++) {
            let documentData = saving.files[i].docData;
            documentData = documentData.toString('base64')
               
            documentData = `data:${saving.files[i].docType};base64,${documentData}`
            if (imageTypes.includes(saving.files[i].docType)) {
                saving.files[i]['isImage'] = true
            }
            saving.files[i].docData = documentData
    }
    let { userName } = await User.findOne({ profileId: saving.owner.profileId})
    let ownerName = userName
    
    if ( email == saving.owner ) ownerName = 'You'
        res.render('savings/savingPage', {
            savingInfo: saving,
            ownerName,
            
        })
})
       


  
   
    // updating user obeject
router.post('/', verifyToken, async (req, res, next) => {
    if(res.locals.ejected){ // local for check if user ejected
        return
    }
    const {name} = req.body // name of saving
    let files = req.body.files // array of encoded files
    let savingId = uniqid('save_')
    let involved = JSON.parse(req.body.involved)
    let savingDocuments = [] // all files to save
    let isPrivate = false ; // private saving 
    if (req.body.private) {
        isPrivate = true;
    }
    
    if( !isPrivate ) {
        involved = []
    }
    else {
        // finding involved users ids
        for ( let i = 0; i < involved.length; i++ ) {
            User.findOne({ profileId: involved[i].profileId }).then(async(doc) => {
                doc.savingsInvolved = {
                    name,
                    savingId
                }
                await doc.save()
            })
        
        }
    }
    
    
   
    // updating user obeject
    let { id } =  jwt.decode(req.signedCookies.accessToken);
    let currentUser  = await User.findOne({ profileId: id  })
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
            docData:  new Buffer.from(files[i].data, 'base64')
        }
        savingDocuments.push(new File({...encodedFile}))
    }

    let today = new Date()
    let todayString =  `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}` // getting today in a human readable string
    let saving = new Saving({
        savingId,
        name,
        filesTotalSize,
        involved,
        stringCreateDate: todayString,
        filesAmount: savingDocuments.length,
        owner: {
            name: currentUser.userName,
            profileId: id
        },
        private: isPrivate || false,
        files: savingDocuments

    });
    await currentUser.save()
    await saving.save();
    return res.redirect('/savings/' + savingId);


})


module.exports = router;