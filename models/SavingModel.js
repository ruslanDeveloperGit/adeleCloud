const { Schema, model } = require('mongoose')
const FileSchema = new Schema({
    docName: {
        type: String,
        required: true
    },
    docType: {
        type: String,
        required: true
    },
    docSize: {
        type: Number,
        required: true
    },
    docData: {
        type: Buffer,
        required: true
    }
})

const SavingSchema = new Schema({
    name: {
        type: String,
        required: true,
        maxlength: 30,
    },
    savingId: {
        type: String, 
        required: true, 
    },
    owner: {
        required: true,
        type: String,
        required: true,
    },
    filesTotalSize: {
        type: Number,
        default: 0
    },
    files: [ FileSchema ],
    filesAmount:{
        type:Number,
        required: true,
        default: 0
    },
    private: {
        type: Boolean,
    },
    createDate: {
        required: true,
        type: Date,
        default: Date.now()
    },
    stringCreateDate: {
        required: true,
        type: String,
    },
    involved: [ {
        name: String,
        profileId: String
    } ]

    
});
module.exports = model('Saving', SavingSchema);