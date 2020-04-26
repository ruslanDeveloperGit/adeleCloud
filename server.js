if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const { verifyToken } = require('./helpers/tokenVerify')

const savingsRouter = require('./routes/savings');
const authRouter = require('./routes/auth')

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('view options', { basedir: __dirname})
app.locals.basedir = path.join(__dirname, 'views')
app.use(express.static(path.join(__dirname + '/public')))
app.use(bodyParser.json({limit: '20mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '20mb', extended: true}))
app.use(cookieParser(process.env.COOKIE_SECRET))

mongoose.connect(process.env.DB_URL, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
const db = mongoose.connection

db.on('error', e => console.error(e))
db.once('connected', () => console.log('MongoDB connected to the server...'))

app.get('/', (req, res) => {
    res.redirect('/savings')
})
app.use('/savings/',verifyToken, savingsRouter);
app.use('/auth/', authRouter)


app.listen(process.env.PORT || 8080, console.log(`Server started on port: ${process.env.PORT || 3000}`))