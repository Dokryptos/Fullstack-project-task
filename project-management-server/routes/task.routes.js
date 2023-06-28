const router = require("express").Router();
// const mongoose = require("mongoose");

const Task = require("../models/Task.model");
const Project = require("../models/Project.model");

//  POST /api/tasks  -  Creates a new task
router.post("/tasks", (req, res, next) => {
    const { title, description, projectId } = req.body;

    const newTaskDetails = { 
        title: title, 
        description: description, 
        project: projectId
    };

    Task.create(newTaskDetails)
        .then(taskFromDB => {
            return Project.findByIdAndUpdate(projectId, { $push: { tasks: taskFromDB._id } });
        })
        .then(response => res.status(201).json(response))
        .catch(err => {
            console.log("error creating a new task", err);
            res.status(500).json({
                message: "error creating a new task",
                error: err
            });
        })
});

module.exports = router