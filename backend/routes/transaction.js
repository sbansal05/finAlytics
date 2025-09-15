const { Router } = require("express");
const { transactionModel } = require("../models/transaction");
const { accountModel } = require("../models/account");
const { authMiddleware } = require("../middleware/auth");
const mongoose = require('mongoose');


const transactionRouter = Router();
//authenitcation to all routes
transactionRouter.use(authMiddleware);

//create transaction
transactionRouter.post("/", async (req, res) => {
    const { accountId, amount, description, category, date, type } = req.body;
    if (!accountId || !amount || !description || !category || !date || !type) {
        return res.status(400).json({
            message: "All fields are required"
        })
    }
    if (!["income", "expense"].includes(type)) {
        return res.status(400).json({
            message: "Type must be expense or income"
        })
    } 
    
    try {
        const accountObjectId = new mongoose.Types.ObjectId(req.body.accountId);
        const userObjectId = new mongoose.Types.ObjectId(req.userId);
        const account = await accountModel.findOne({
            _id: accountObjectId,
            userId: userObjectId,
            isActive: true
        });
        console.log('Found account:', account);

        console.log({
            searchedAccountId: accountId,
            searchedUserId: req.userId,
            typeAccountId: typeof accountId,
            typeUserId: typeof req.userId
        });
        if(!account) {
            return res.status(404).json({ message: "Account not found"});
        }

        const transaction = await transactionModel.create({
            userId: req.userId,
            accountId: accountObjectId,
            amount: type === "expense"? -Math.abs(amount) : Math.abs(amount),
            description: description,
            category: category,
            date: date,
            type: type
        });

        account.balance +=transaction.amount;
        await account.save();

        return res.status(200).json ({ 
            message: "Transaction created successfully",
            transaction
        });
    } catch (error) {
        console.log("Error creating transaction: ", error);
        return res.status(500).json({ message: "Server error" });
    }
});

//list all transactions
transactionRouter.get("/", async (req, res) => {
    try {
        const query = { userId: req.userId};
        if (req.query.accountId) query.accountId = req.query.accountId;

        const transactions = await transactionModel.find(query).sort({ date: -1});
        res.json({ transactions });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch transactions "});
    }
});

//update transactions
transactionRouter.put("/:id", async (req, res) => {
    const { amount, description, category, date, type, accountId } = req.body;
    try {
        const transaction = await transactionModel.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!transaction) return res.status(404).json({
            message: "Transaction not found"
        })

        if (amount !== undefined || type !== undefined || accountId !==undefined) {
            const oldAccount = await accountModel.findById(transaction.accountId);
            if (oldAccount) {
                oldAccount.balance -= transaction.amount;
                await oldAccount.save();
            }

            if (accountId) transaction.accountId = accountId;
            if (type) transaction.type = type;
            if (amount !== undefined) {
                transaction.amount = transaction.type === "expense" ? -Math.abs(amount) : Math.abs(amount)
            }

            const newAccount = await accountModel.findById(transaction.accountId);
            if (newAccount) {
                newAccount.balance += transaction.amount;
                await newAccount.save();
            }
        }

        if (description) transaction.description = description;
        if (category) transaction.category = category;
        if (date) transaction.date = date;

        await transaction.save();
        res.json({
            message: "Transaction updated",
            transaction
        })
    } catch (error) {
        console.log("Error updating transaction: ", error);
        return res.status(500).json({ message: "Server error" });
    }
})

//delete transaction
transactionRouter.delete("/:id", async (req, res) => {
    try {
        const transaction  = await transactionModel.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }
        const account = await accountModel.findById(transaction.accountId);
        if (account) {
            account.balance -= transaction.amount;
            await account.save();
        }

        await transaction.deleteOne();
        res.json({
            message: 'Transaction deleted'
        });
    } catch (error) {
        console.log("Error deleting transaction");
        return res.status(500).json({ message: "Server error" });
    }
});



transactionRouter.get("/summary", async (req, res) => {
    try {
        const userId = req.userId;

        const aggregation = await transactionModel.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId)}},
            {
                $group: {
                    _id: "$type",
                    totalAmount: { $sum: "$amount" }
                }
            }
        ]);

        const summary = {
            income: 0,
            expense: 0,
            net: 0
        };

        aggregation.forEach(item => {
            if (item._id === "income") summary.income = item.totalAmount;
            else if (item._id === "expense") summary.expense = item.totalAmount;
        });

        summary.net = summary.income + summary.expense;

        res.json(summary);
    } catch (error) {
        console.error("Failed to get summary:", error);
        res.status(500).json({ message: "Server error" });
    }
});

transactionRouter.get("/summary/filter", async (req, res) => {
  try {
    const query = { userId: req.userId };

    if (req.query.accountId) query.accountId = req.query.accountId;

    if (req.query.type) {
      if (["income", "expense"].includes(req.query.type)) {
        query.type = req.query.type;
      } else {
        return res.status(400).json({ message: "Invalid transaction type filter" });
      }
    }

    if (req.query.category) query.category = req.query.category;

    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) query.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.date.$lte = new Date(req.query.endDate);
    }

    const transactions = await transactionModel.find(query).sort({ date: -1 });
    res.json({ transactions });
  } catch (error) {
    console.error("Failed to fetch filtered transactions", error);
    res.status(500).json({ message: "Failed to fetch filtered transactions" });
  }
});


transactionRouter.get("/:id", async (req, res) => {
  try {
    const transaction = await transactionModel.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid transaction id'})
    }
    return res.json({ transaction });
  } catch (error) {
    console.log("Error fetching transaction:", error);
    return res.status(500).json({ message: "Server error" });
  }
});


module.exports = { transactionRouter };