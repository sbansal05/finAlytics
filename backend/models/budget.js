const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const budgetSchema = new Schema({
    userId: { 
        type: ObjectId,
        ref: "user",
        required: true
    },
    category: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true
    },
    month: { // use YYYY-MM format for filtering
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const budgetModel = mongoose.model('budget', budgetSchema);
module.exports = {
    budgetModel
}