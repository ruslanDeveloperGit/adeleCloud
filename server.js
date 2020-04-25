if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose')

const homeRouter = require('./routes/index');


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static('public'))

mongoose.connect(process.env.DB_URL, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
const db = mongoose.connection

db.on('error', e => console.error(e))
db.once('connetc', () => console.log('MongoDB connected to the server...'))

app.use('/', homeRouter);

app.listen(process.env.PORT || 8080, console.log(`Server started on port: ${process.env.PORT || 3000}`))