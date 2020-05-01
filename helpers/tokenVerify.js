const jwt = require('jsonwebtoken')

module.exports.verifyToken =  (req, res, next) => {
    if (!req.signedCookies) {
        req.local.ejected = true;
        return res.redirect('/auth/login')
    }
    let accessToken = req.signedCookies['accessToken']
    let refreshToken = req.signedCookies['refreshToken']
    jwt.verify(accessToken, process.env.ACCESS_TOKEN, (err, accessTokenDecoded) => {
        if (!accessTokenDecoded) {
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, refreshTokenDecoded) => {
                if(!refreshTokenDecoded){
                    res.clearCookie('refreshToken').clearCookie('accessToken')
                    res.locals.ejected = true
                    res.redirect('/auth/login')
                    return next()
                }
                res.clearCookie('refreshToken').clearCookie('accessToken')
                const { email, id, name } = refreshTokenDecoded;
                const newAccessToken = jwt.sign(
                    {
                        email,
                        id
                    },
                    process.env.ACCESS_TOKEN,
                    {
                        expiresIn: 60 * 30
                    }
                )
                const newRefreshToken = jwt.sign(
                    {
                        email,
                        name,
                        id
                    },
                    process.env.REFRESH_TOKEN,
                    {
                        expiresIn: '1h'
                    }
                )
                res.cookie('accessToken', newAccessToken, {httpOnly: true, signed: true, })
                res.cookie('refreshToken', newRefreshToken, {httpOnly: true, signed: true, });

            })
        }
    })
    next()
}