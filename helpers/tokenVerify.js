const jwt = require('jsonwebtoken')

module.exports.verifyToken = (req, res, next) =>{
    if (!req.cookies) {
        return res.redirect('/auth/login')
    }
    let accessToken = req.cookies['accessToken']
    let refreshToken = req.cookies['refreshToken']
    jwt.verify(accessToken, process.env.ACCESS_TOKEN, (err, accessTokenDecoded) => {
        console.log(accessTokenDecoded)
        if (!accessTokenDecoded) {
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, refreshTokenDecoded) => {
                console.log(refreshTokenDecoded)
                if(!refreshTokenDecoded){
                    res.clearCookie('refreshToken').clearCookie('accessToken')
                    return res.redirect('/auth/login')
                }
                res.clearCookie('refreshToken').clearCookie('accessToken')
                const { email, password } = refreshTokenDecoded;
                const newAccessToken = jwt.sign(
                    {
                        email,
                        password
                    },
                    process.env.ACCESS_TOKEN,
                    {
                        expiresIn: 60 * 30
                    }
                )
                const newRefreshToken = jwt.sign(
                    {
                        email,
                        password
                    },
                    process.env.REFRESH_TOKEN,
                    {
                        expiresIn: '1h'
                    }
                )
                res.cookie('accessToken', newAccessToken, { httpOnly: true })
                res.cookie('refreshToken', newRefreshToken, { httpOnly: true });
                next()
            })
        }
    })
    next()
}