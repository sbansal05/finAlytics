const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

const goalSchema = new Schema ({
    userId: {
        type: ObjectId,
        ref: 'user',
        required: 'true',
    },
    title: {
        type: String,
        required: true
    },
    targetAmount: {
        type: Number,
        required: true
    },
    currentAmount: {
        type: Number,
        default: 0
    },
    deadline: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['in-progress', 'achieved', 'failed'],
        defaut: 'in-progress'
    }
}, {
    timestamps: true
});

const goalModel = mongoose.model('goal', goalSchema);
module.exports = {
    goalModel
};