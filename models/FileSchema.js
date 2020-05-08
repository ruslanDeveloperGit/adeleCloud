const { Schema, model } = require('mongoose');

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
    },
    docId: {
        type: String,
        required: true,
    }
})

module.exports =  model('File', FileSchema)