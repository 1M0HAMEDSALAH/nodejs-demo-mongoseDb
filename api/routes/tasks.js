const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// Get all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json({ status: "success", count: tasks.length, tasks });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Get single task
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create task
router.post("/", async (req, res) => {
  try {
    const task = new Task({
      title: req.body.title,
      description: req.body.description
    });
    const saved = await task.save();
    res.status(200).json({ message: "Task created", task: saved });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: "Validation error", errors });
    }
    res.status(500).json({ message: err.message });
  }
});

// Update task
router.put("/:id", async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task updated", task: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete task
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted", taskId: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
