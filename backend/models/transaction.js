const mongoose = require ("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const transactionSchema = new Schema({
    userId: {
        type: ObjectId,
        ref: 'user',
        required: true
    },
    accountId: {
        type: ObjectId,
        ref: "account",
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Transaction amount is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, "Category is required"]
    },
    date: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: ["income", "expense"],
        required: [true, "Transaction type is required"]
    }
}, {
    timestamps: true
})

const transactionModel = mongoose.model("transaction", transactionSchema);
module.exports = {
    transactionModel
}