const { Router } = require("express");
const { accountModel } = require("../models/account");
const { authMiddleware } = require("../middleware/auth");

const accountRouter = Router();
accountRouter.use(authMiddleware);
//get all accounts of a user
accountRouter.get('/', async (req, res) => {
    try {
        const accounts = await accountModel.find({
            userId: req.userId,
            isActive: true
        });

        res.json({
            accounts
        });
    } catch (error){
       console.log("Error retreiving accounts: ", error);
    }
});

//creating a new account

accountRouter.post('/', async (req, res) => {
    const {name, type, balance} = req.body;
    if(!name) {
        return res.status(400).json({
            message: "Name is required"
        })
    } else if (!type) {
        return res.status(400).json({
            message: "Account type is required"
        })
    }
    if (!['checking', 'savings', 'credit'].includes(type)) {
        return res.status(400).json({
            message: 'Invalid account type'
        });
    }

    try {
        const newAccount = await accountModel.create({
            userId: req.userId,
            name,
            type,
            balance: balance || 0
        });
        res.status(200).json({
            message: "Account created",
            account: newAccount
        });
    } catch (error) {
        console.log("Error creating account: ", error);
    }
});
//update account
accountRouter.put('/:id', async (req, res) => {
    const { name, type, balance } = req.body;
    try {
        const account = await accountModel.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if(!account) {
            return res.status(404).json({
                message: "Account not found"
            })
        }

        if (name) account.name = name;
        if (type) {
            if(!['checking', 'savings', 'credit']) {
                return res.status(400).json({
                    message: "Invalid account type"
                })
            }
            account.type = type
        }

        if (balance !==undefined) account.balance = balance;
        await account.save(); //save function persists the change made in put handler
        res.json({
            message: "Account updated",
            account
        })
    } catch (error) {
        console.log("Error updating account: ", error)
    }
});

//deleting account
accountRouter.delete('/:id', async (req, res) => {
    try {
        const account = await accountModel.findOne({
            _id: req.params.id,
            userId: req.userId
        });
        if (!account) {
            return res.status(404).json({
                message: "Account not found"
            })
        }
        account.isActive = false;
        await account.save();
        res.json({
            message: "Account deleted"
        })
    } catch (error) {
        console.log("Error deleting account: ", error)
    }
});

module.exports = {
    accountRouter: accountRouter
}