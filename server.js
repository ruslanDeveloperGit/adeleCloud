if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose')

const savingsRouter = require('./routes/savings');


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('view options', { basedir: __dirname})
app.locals.basedir = path.join(__dirname, 'views')
app.use(express.static(path.join(__dirname + '/public')))

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
app.use('/savings/', savingsRouter);

app.listen(process.env.PORT || 8080, console.log(`Server started on port: ${process.env.PORT || 3000}`))