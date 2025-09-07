const mongoose  = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const accountSchema = new Schema({
    userId: {
        type: ObjectId,
        ref: 'user',
        required: true
    }, 
    name : {
        type: String,
        required: [true, 'Account name is required'],
        trim: true
    },
    type: {
        type: String,
        enum: ['checking', 'savings', 'credit'],
        required: [true, 'Account type is required']
    },
    balance: {
        type: Number,
        default: 0
    }, isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const accountModel = mongoose.model("account", accountSchema);

module.exports = {
    accountModel
}