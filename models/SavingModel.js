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
    // owner: {
    //     type: String,
    //     required: true,
    // },
    files: [ FileSchema ],
    private: {
        type: Boolean,
    },
    createDate: {
        type: Date,
        default: Date.now()
    }
});
module.exports = model('Saving', SavingSchema);