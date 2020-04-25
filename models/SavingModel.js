const { Schema, model } = require('mongoose')

const SavingSchema = new Schema({
    name: {
        type: String,
        required: true,
        maxlength: 30,
    },
    files: {
        required: true,
        type: Array
    },
    private: {
        type: Boolean,
    },
    createDate: {
        type: Date,
        default: Date.now()
    }
});

module.exports = model('Saving', SavingSchema);