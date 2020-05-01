const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    email: {
        unique: true,
        type: String,
        required: true,
    },
    profileId: {
        type: String,
        required: true
    },
    userName: {
        unique: true, 
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
    privateSavings : {
        type: Number,
        default: 0,
    },
    publicSavings: {
        type: Number,
        default: 0,
    },
    friends: [ {
        name: String,
        profileId: String
    } ],
    favorites: [ {
        name: String,
        savingId: String
    }],
    savingsInvolved: [ {
        name: String,
        savingId: String
    } ],
    totalDocumentsSize: {
        type: Number,
        default: 0
    },
    sentRequests: [ {
        to: String,
        profileId: String,
        requestDate: Date
    } ],
    receivedRequests: [ {
        from: String,
        profileId: String,
        pendingDate: {
            type: Date,
            default: Date.now()
        }
    } ]
    
});

module.exports = model('User', UserSchema);