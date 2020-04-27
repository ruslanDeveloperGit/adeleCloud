const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    email: {
        unique: true,
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
        maxlength: 15,
        minlength: 2,
    },
    password: {
        type: String,
        required: true
    },
    totalSavings: {
        type: Number,
        default: 0
    },
    totalDocumentsSize: {
        type: Number,
        default: 0
    }
    
});

module.exports = model('User', UserSchema);