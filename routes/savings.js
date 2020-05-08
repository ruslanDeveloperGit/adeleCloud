const { Router } = require('express');
const router = Router();
const jwt = require('jsonwebtoken')
const uniqid = require('uniqid')
const { AES, enc } = require('crypto-js')

const imageTypes = ['image/png', 'image/jpeg', 'image/jpg']
// db model
const Saving = require('../models/SavingModel')
const File = require('../models/FileSchema')
const User = require('../models/UserModel')

const { verifyToken } = require('../helpers/tokenVerify')

function convertSize(bytes) {
    let size = bytes / 1000
    if( size > 1000 ) size = Math.round(size / 1000) + 'MB'
    else size = Math.round(size) +  'KB'
    return  size
}

// all user savings 
router.get('/', verifyToken, async (req, res, next) => {
    if(res.locals.ejected){ // local for check if user ejected
        return
    }
    try{
        const { accessToken } = req.signedCookies;
        const { id } = jwt.decode(accessToken)

        let   userSavings = await Saving.find({ "owner.profileId": id });
        let currentUser = await User.findOne({ profileId: id });

        const totalUserFilesSize  = convertSize(currentUser.totalDocumentsSize)
        currentUser = currentUser.toObject()
        currentUser['totalDocumentsSize'] = totalUserFilesSize

        for ( let i = 0; i < userSavings.length; i++ ) {
            const totalSavingSize = convertSize(userSavings[i].filesTotalSize)
            userSavings[i] = userSavings[i].toObject()
            userSavings[i]['filesTotalSize'] = totalSavingSize

            if ( userSavings[i].name.length > 35) userSavings[i].name = userSavings[i].name.slice(0, 35) + '...'

            for ( let j = 0; j < userSavings[i].files.length; j++) {
                if ( i > 2) break;

                if (userSavings[i].files[j].docName.length > 30) userSavings[i].files[j].docName = userSavings[i].files[j].docName.slice(0, 30) + '...' 
                const totalDocumentSize = convertSize(userSavings[i].files[j].docSize)
                userSavings[i].files[j].docData = null
                userSavings[i].files[j]['docSize'] = totalDocumentSize
            }
        }
        res.render('savings/index', {
            savings: userSavings.reverse(),
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

router.post('/edit', async ( req, res ) => {
    const { savingId, newName, filesToDelete } = req.body;
    const { id } = jwt.decode(req.signedCookies.accessToken)


    let saving = await Saving.findOne({ savingId }); // getting files in update saving
    let editingUser = await User.findOne({ profileId: id })
    const needsToDelete = filesToDelete.length == saving.filesAmount
    editingUser.totalDocumentsSize -= saving.filesTotalSize // decreasing by during state of size

    saving.filesTotalSize = 0
    let newFilesTotalSize = 0;
    for ( let i = 0; i < filesToDelete.length; i++ ) {
        saving.files = saving.files.filter(file => {
            return file.docId != filesToDelete[i].id 
        })
    }
    saving.files.forEach(file => {
        newFilesTotalSize += file.docSize
    });
    saving.filesAmount = saving.files.length; 
    saving.filesTotalSize = newFilesTotalSize;
    if ( newName ) saving.name = newName

    editingUser.totalDocumentsSize += saving.filesTotalSize // after updating adding new size

    if ( needsToDelete ) {
        await Saving.findOneAndDelete({ savingId })
        for ( let i = 0; i < saving.involved.length; i++) {
            User.findOne({ profileId: saving.involved[i].profileId}, async (err, user ) => {
                user.savingsInvolved = user.savingsInvolved.filter((userSavings) =>{
                    return userSavings.savingId != saving.savingId
                })
                await user.save();

            })
        }
    } else {
        await saving.save()
    }

    await editingUser.save()
    if ( needsToDelete ) return res.sendStatus(404)
    res.sendStatus(200)
})


router.post('/delete', async (req, res) => {
    const { savingId } = req.body;

    const savingToDelete = await Saving.findOne({ savingId });
    const deletingUser = await User.findOne({ profileId: savingToDelete.owner.profileId });


    deletingUser.totalSavings -= 1
    if ( savingToDelete.private ) deletingUser.privateSavings -= 1
    else deletingUser.publicSavings -= 1
    deletingUser.totalDocumentsSize -= savingToDelete.filesTotalSize
    await Saving.findOneAndDelete({ _id: savingToDelete._id})
    for ( let i = 0; i < savingToDelete.involved.length; i++) {
        User.findOne({ profileId: savingToDelete.involved[i].profileId}, async (err, user ) => {
            user.savingsInvolved = user.savingsInvolved.filter((userSavings) =>{
                return userSavings.savingId != savingToDelete.savingId
            })
            await user.save()
        });
    }
    await  deletingUser.save()
    res.sendStatus(200)

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
    saving.filesTotalSize = convertSize(saving.filesTotalSize)
    for (let i = 0; i < saving.files.length; i++) {
            let documentData = saving.files[i].docData
            documentData = documentData.toString('base64')   

            documentData = `data:${saving.files[i].docType};base64,${documentData}`
            if (imageTypes.includes(saving.files[i].docType)) {
                saving.files[i]['isImage'] = true
            }
            saving.files[i].docData = documentData
            saving.files[i].docSize = convertSize(saving.files[i].docSize)
    }
    let ownerUser = await User.findOne({ profileId: saving.owner.profileId})
    const  ownerName = ownerUser.userName
    const isOwner =  ownerUser.profileId == id
    
    if ( email == saving.owner ) ownerName = 'You'
        res.render('savings/savingPage', {
            savingInfo: saving,
            ownerName,
            isOwner
            
        })
})
       
router.get('/:id/edit', async (req, res) => {
    if(res.locals.ejected) return
    try {
        let savingId = req.params.id
        const { id } = jwt.decode(req.signedCookies.accessToken)


        if (!savingId.startsWith('save_')) {
            return res.send('Invalid id of saving')
        }
        let saving = await Saving.findOne({ savingId }) 
        if ( !saving ) {
            return res.send('Saving not found')
        }
        if (saving.owner.profileId != id) {
            return res.send("You can't edit this saving")
        }
        saving = saving.toObject()
        for (let i = 0; i < saving.files.length; i++) {
                let documentData;
                if (imageTypes.includes(saving.files[i].docType)) {
                    documentData = saving.files[i].docData.toString('base64') 
                
                    documentData = `data:${saving.files[i].docType};base64,${documentData}`
                    saving.files[i]['isImage'] = true
                } else {
                    documentData = null;
                }
                saving.files[i].docData = documentData
                saving.files[i].docSize = convertSize(saving.files[i].docSize)

        }

        res.render('savings/edit', {
            savingInfo: saving,
            ownerName: saving.owner.name
        })
    } catch (e) {
        console.log(e)
    }
})
  
   
    // updating user obeject
router.post('/', async (req, res, next) => {
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
            docData:  new Buffer.from(files[i].data, 'base64'),
            docId: uniqid('doc_')
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
    if (currentUser.totalDocumentsSize > 50 * 1000 * 1000) {
        return res.send("После сохранения не будет места")
    }
    await saving.save();
    await currentUser.save()
    return res.redirect('/savings/' + savingId);


})


module.exports = router;