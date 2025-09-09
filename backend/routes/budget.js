const { Router } = require("express");
const { budgetModel } = require("../models/budget");
const { transactionModel } = require("../models/transaction");
const { authMiddleware } = require("../middleware/auth");

const budgetRouter = Router();

budgetRouter.use(authMiddleware);

//create budget
budgetRouter.post("/", async (req, res) => {
    const {category, amount, month} = req.body;
    if (!category || !amount || !month) {
        return res.status(400).json({
            message: "All fields are required"
        })
    }

    try {
        const newBudget = await budgetModel.create({
            userId: req.userId,
            category: category,
            amount: amount,
            month: month
        });
        return res.status(201).json({
            message: "Budget created",
            budget: newBudget
        })
    } catch (error) {
        console.log("Error creating budget: ", error);
        res.status(500).json({ message: "Server Error"});
    }
});

// get budgets by user and month filter
budgetRouter.get("/", async (req, res) => {
    try {
        const query = { userId: req.userId };
        if(req.query.month) query.month = req.query.month;
        const budgets = await budgetModel.find(query);
        res.json({ budgets });
    } catch( error ) {
        console.log(" Error fetching budget: ", error);
        res.status(500).json({
            message: "Server Error"
        })
    }
});

//calculates budget usage 
budgetRouter.get("/usage", async (req, res) => {
    try {
        const month = req.query.month;
        if (!month) return res.status(400).json({ message: "Month param required"});

        const budgets = await budgetModel.find({
            userId: req.userId,
            month
        });

        const spent = await transactionModel.aggregate([
            { $match: { userId: req.userId, month, type: 'expense'}},
            { $group: {_id: "$category", totalSpent: {$sum: "$amount"}}}
        ]);

        const usage = budgets.map(budget => {
            const spentObj = spent.find(s => s._id === budget.category);
            const amountSpent = spentObj ? Math.abs(spentObj.totalSpent) : 0;
            const remaining = budget.amount - amountSpent;
            const percentUsed = (amountSpent / budget.amount) * 100;
            return {
                category: budget.category,
                budgetAmount: budget.amount,
                amountSpent,
                remaining,
                percentUsed
            };
            
        });

        res.json({ usage });
    } catch (error) {
        console.error("Error fetching budget usage: ", error);
        res.status(500).json({ message: "Server error" });
    }
});

//update budget by id
budgetRouter.put("/:id", async (req, res) => {
    try {
        const budget = await budgetModel.findOne({
            _id: req.params.id,
            userId: req.userId
        })
        if (!budget) {
            return res.status(404).json({
                message:"Budget not found"
            })
        }
        const { category, amount, month} = req.body;
        if (category) {
            budget.category = category;
        }
        if (amount) {
            budget.amount = amount;
        }
        if (month) {
            budget.month = month;
        }
        await budget.save();
        res.json({
            message: "Budget updated",
            budget
        });
    } catch (error) {
        console.log("Error updating budget: ", error);
        res.status(500).json({ message: "Server Error"});
    }
});

//delete budget by Id
budgetRouter.delete("/:id", async (req, res) => {
    try {
        const budget = await budgetModel.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });
        if (!budget) {
            res.status(404).json({
                message: "Budget not found"
            });
        }
        res.status(200).json({ message: "Budget deleted"});
    } catch (error) {
        console.log('Error deleting budget: ', error);
        res.status(500).json({ message: "Server error"});
    }
});

module.exports = { budgetRouter };