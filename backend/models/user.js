const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },

    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']

    },

    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be atleast 6 characters']
    },

    avatar: {
        type: String,
        default: null
    },

    
        
}, {
    timestamps: true
});

const userModel = mongoose.model("user", userSchema);

module.exports = {
    userModel
}