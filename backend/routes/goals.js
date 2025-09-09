const { Router } = require("express");
const { goalModel } = require("../models/goal");
const { authMiddleware } = require("../middleware/auth");

const goalsRouter = Router();

goalsRouter.use( authMiddleware );

//create goal
goalsRouter.post("/", async (req, res) => {
    const { title, targetAmount, currentAmount, deadline } = req.body;
    if (!title || !targetAmount || !deadline) {
        return res.status(400).json({
            message: 'All fields are required'
        });
    } try {
        const newGoal = await goalModel.create({
            userId: req.userId,
            title,
            targetAmount,
            currentAmount,
            deadline
        });
        res.status(201).json({
            message: "Goal created",
            goal: newGoal
        })
    } catch (error) {
        console.log("Error creating goal:", error);
        res.status(500).json({ message: "Server error" });
    }
})
//get all goals
goalsRouter.get("/", async (req, res) => {
  try {
    const goals = await goalModel.find({ userId: req.userId });
    res.json({ goals });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch goals" });
  }
});

//update goal by Id
goalsRouter.put("/:id", async (req, res) => {
    try {
        const goal = await goalModel.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!goal) {
            res.status(404).json({ message: 'goal not found'});
        }

        const { title, targetAmount, currentAmount, deadline, status } = req.body;
        if (title) goal.title = title;
        if (targetAmount) goal.targetAmount = targetAmount;
        if (currentAmount !== undefined) goal.currentAmount = currentAmount;
        if (deadline) goal.deadline = deadline;
        if (status) goal.status = status;

        await goal.save();
        res.json({ message: "Goal updated", goal });

    } catch (error) {
        res.status(500).json({ message: "Failed to update goal" });
    }
});

// Delete goal
goalsRouter.delete("/:id", async (req, res) => {
  try {
    const goal = await goalModel.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    res.json({ message: "Goal deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete goal" });
  }
});

module.exports = { goalsRouter };