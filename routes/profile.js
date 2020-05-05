const { Router } = require('express');
const jwt = require('jsonwebtoken')
const router = Router();
const { verifyToken } = require('../helpers/tokenVerify')

const User = require('../models/UserModel');

router.get('/', verifyToken, async (req, res) => {
    if (res.locals.ejected ) return 
    try {
        const { accessToken } = req.signedCookies; // access token of currend user
        const { email } = jwt.decode(accessToken)  // email form jwt
        const user = await User.findOne({ email }); // during user data

        return res.render('profile/profilePage', {
            user: user,
            own: true 
        })
    } catch (e) {
        console.log(e)
    }
})
router.get('/friends', verifyToken, async (req, res) => {
    if ( res.locals.ejected ) return
    try {
        let { id } = await jwt.decode(req.signedCookies.accessToken) 
        const { friends, receivedRequests, sentRequests } = await User.findOne({ profileId: id }) // find user friends and requests to display
        res.render('profile/friends', {
            friends,
            receivedRequests,
            sentRequests,
        })
    } catch (e) {
        console.log(e)
    }
})

router.get('/getFriends', verifyToken, async(req, res) => {
    if ( res.locals.ejected ) return
    const { profileId } = req.query;
    const { friends } = await User.findOne({ profileId });
    
    res.send({
        friends,
    })
})

router.post('/sendRequest/:profileId',verifyToken , async (req, res) => {
    if ( res.locals.ejected ) return 
    let { accessToken } = req.signedCookies;
    let sendingUserId = jwt.decode(accessToken).id // requesting user id
    let receivingUserId = req.params.profileId
    const sendingUser = await User.findOne({ profileId: sendingUserId });
    const receivingUser = await User.findOne({ profileId: receivingUserId });

    sendingUser.sentRequests.push({
        to: receivingUser.userName,
        profileId: receivingUser.profileId,
    })
    receivingUser.receivedRequests.push({
        from: sendingUser.userName,
        profileId: sendingUser.profileId
    })
    await sendingUser.save()
    await receivingUser.save()
    return res.redirect('/profile/' + receivingUserId)


})

router.post('/acceptRequest/:profileId', verifyToken, async  (req, res ) => {
    if (res.locals.ejected) return
    let { accessToken } = req.signedCookies;
    let duringUserId  = jwt.decode(accessToken).id
    let requestedUserId = req.params.profileId
    const duringUser = await User.findOne({ profileId: duringUserId})
    const requestedUser = await User.findOne({ profileId: requestedUserId});

    // updating during user object by deleting during request and adding requested user to friends
    duringUser.receivedRequests  = duringUser.receivedRequests.filter(( request ) => {
        return request.profileId !== requestedUserId
    })
    duringUser.friends.push({
        name: requestedUser.userName,
        profileId: requestedUser.profileId
    })
    // then updating requested user profile by deleting sent request and adding during user to friends
    requestedUser.sentRequests = requestedUser.sentRequests.filter((request) => {
       return  request.profileId !== duringUserId
    })
    requestedUser.friends.push({
        name: duringUser.userName,
        profileId: duringUser.profileId
    })

    await duringUser.save()
    await requestedUser.save()
    return res.redirect('/profile/' + requestedUserId)

})

router.post('/declineRequest/:profileId', verifyToken, async (req, res ) => {
    if (res.locals.ejected) return
    let { accessToken } = req.signedCookies;
    let duringUserId  = jwt.decode(accessToken).id
    let requestedUserId = req.params.profileId
    const duringUser = await User.findOne({ profileId: duringUserId})
    const requestedUser = await User.findOne({ profileId: requestedUserId});

    // updating during user object by deleting during request
    duringUser.receivedRequests = duringUser.receivedRequests.filter(( request ) => {
        return request.profileId !== requestedUserId
    })
    // then updating requested user profile by deleting sent request
    requestedUser.sentRequests = requestedUser.sentRequests.filter((request) => {
        return request.profileId !== duringUserId
    })

    await duringUser.save()
    await requestedUser.save()
    return res.redirect('/profile/' + requestedUserId)
})

router.post('/cancelRequest/:profileId', verifyToken, async (req, res) => {
    if (res.locals.ejected) return
    let { accessToken } = req.signedCookies;
    let duringUserId  = jwt.decode(accessToken).id
    let sentRequestId = req.params.profileId
    const duringUser = await User.findOne({ profileId: duringUserId})
    const sentRequestUser = await User.findOne({ profileId: sentRequestId});

    // updating during user object by deleting during request
    duringUser.sentRequests =  duringUser.sentRequests.filter(( request ) => {
        return request.profileId != sentRequestId
    })
    // then updating requested user profile by deleting sent request
    sentRequestUser.receivedRequests = sentRequestUser.receivedRequests.filter((request) => {
        return request.profileId != duringUserId
    })

    await duringUser.save()
    await sentRequestUser.save()
    return res.redirect('/profile/' + sentRequestId)
})
router.post('/removeFriend/:profileId', verifyToken, async (req, res) => {
    if (res.locals.ejected) return 
    let { accessToken } = req.signedCookies;
    let duringUserId  = jwt.decode(accessToken).id
    let removeUserId = req.params.profileId
    const duringUser = await User.findOne({ profileId: duringUserId})
    const removeUser = await User.findOne({ profileId: removeUserId});

    // updating during user object by deleting during request
    duringUser.friends =  duringUser.friends.filter(( friend ) => {
        return friend.profileId != removeUserId
    })
    // then updating requested user profile by deleting sent request
    removeUser.friends = removeUser.friends.filter((friend) => {
        return friend.profileId != duringUserId
    })

    await duringUser.save()
    await removeUser.save()
    return res.redirect('/profile/' + removeUserId)

})

router.get('/:profileId', async (req, res) => {
    let profileId = req.params.profileId; 
    let { id }  = jwt.decode(req.signedCookies.accessToken)

    if ( id == profileId ) return res.redirect('/profile') // if user id and id to find are equal, them redirect to the own page

    const { friends, sentRequests, receivedRequests } = await User.findOne({ profileId : id}) // user that now in system

    const userToFind = await User.findOne({ profileId }) // user to find 
    // making object with needed data 
    const userInfo = {
        name: userToFind.userName,
        profileId: userToFind.profileId
    }
    // checing if these users have relationship( e.g they're friends )
    let isRequestSent = !!sentRequests.find((request) => {
        return request.profileId == profileId
    }) // if current user requested for freindship
    let isRequestReceived = !!receivedRequests.find((request) => { // if current user to find has requested for friendship
        return request.profileId == userToFind.profileId

    })
    let isFriends = !!friends.find((friend) => {
        return friend.profileId == profileId
    }) // is these users are friends
    // rendering page 
    return res.render('profile/profilePage', {
        user: userToFind,
        own: false,
        isFriends,
        isRequestSent,
        isRequestReceived
    })
})

module.exports = router;