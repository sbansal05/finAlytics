const { Router } = require("express");
const { userModel } = require("../models/user");
const jwt = require("jsonwebtoken");
const { JWT_PASSWORD } = require("../config");
const { authMiddleware } = require("../middleware/auth");
const bcrypt = require("bcrypt");
const { z } = require("zod");

const authRouter = Router();

authRouter.post("/signup", async function(req, res) {

    const { name, email, password, avatar, preferences} = req.body;

    try {

        const existingUser = await userModel.findOne({
            email: email
        })

        if(existingUser) {
            return res.status(409).json({
                message: "User with this email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            name: name,
            email: email,
            password: hashedPassword,
            avatar: avatar,
            preferences: preferences
        })

        res.json({
            message: "Signup succeeded",
            user: { name: user.name, email: user.email }
        })
    } catch(error) {
        console.log("Error signing up: ", error)
    }
});
const emailRegex = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);

const userSigninSchema = z.object({
    email: z.string().regex(emailRegex, "Please enter a avalid email address"),
    password: z.string().min(1, "Password cannot be empty")
});
authRouter.post("/signin", async function (req, res, next) {
    const validation = userSigninSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            message: "Invalid input format",
            errors: validation.error.errors
        })
    }

    const { email, password } = validation.data;

    try {
        const user = await userModel.findOne({
            email: email
        });

        if (user) {

            const isPasswordValid = await bcrypt.compare(password, user.password);
        
            if (isPasswordValid) {
                const token = jwt.sign({
                    id: user._id
                }, JWT_PASSWORD);

                res.json({
                    token: token
                })
            } else {
                res.status(403).json({
                    message: "Incorrect credentials"
                })
            }
        } else {
            res.status(403).json({
                message: "Incorrect credentials"
            })
        }
           
    } catch(error) {
        console.log("Error signing in: ", error);
    }
    
    
})


module.exports = {
    authRouter: authRouter
}