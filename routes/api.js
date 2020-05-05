const { Router } = require('express');
const router = Router();

const User = require('../models/UserModel')
const Saving = require('../models/SavingModel')

router.get('/findQuery', async (req, res) => {
    const  { findString } = req.query
    
    const capturedData = await getQuery(findString.trim())

    res.send(capturedData)
})

router.get('/getDetailedPage', async(req, res) => {
    const { findString } = req.query

    const capturedData = await getQuery(findString.trim())
    res.render('search/detailedPage', {
        capturedData,
        findString
    })
})

async function getQuery(findString) {
    const foundUsers = []
    const foundSavings = []
    const  foundSavingsWithAuthor = []
    // users with given name
    await  User.find({
        userName: new RegExp(findString, 'i')
    },(err, docs) => {
        docs.forEach( user => {
            foundUsers.push({
                userName: user.userName,
                profileId: user.profileId
            })
        });
    }).limit(5)
  

    // savings with given owner
    await Saving.find({
        'owner.name': new RegExp(findString, 'i'),
        private: false,
    } ,(err, docs) => {
        docs.forEach( saving => {
           foundSavingsWithAuthor.push({
                name: saving.name,
                savingId: saving.savingId,
                owner: {
                    name: saving.owner.name,
                    profileId: saving.owner.profileId
                } 
            })
        });
    }).limit(5)
    
    

    // all savings
    await Saving.find({
        name: new RegExp(findString, 'i'),
        private: false,
    }, (err, docs) => {
        docs = docs.filter(saving => {
            return !saving.owner.name.match(new RegExp(findString, 'i'))
        })
        docs.forEach( saving => {
            const savingToPush = {
                name: saving.name,
                savingId: saving.savingId,
                owner: {
                    name: saving.owner.name,
                    profileId: saving.owner.profileId
                } 
            }
            foundSavings.push(savingToPush)
        });
    }).limit(5)
    return foundUsers.concat(foundSavingsWithAuthor, foundSavings)
}

module.exports = router;