const router = require("express").Router();

const mongoose = require("mongoose");

const Project = require("../models/Project.model");
const Task = require("../models/Task.model");
const { isAuthenticated } = require("../middleware/jwt.middleware")


//  POST /api/projects  -  Creates a new project
router.post("/projects", isAuthenticated, (req, res, next) => {
    const { title, description } = req.body;

    const newProject = {
        title: title,
        description: description,
        tasks: []
    }

    Project.create(newProject)
        .then(response => res.status(201).json(response))
        .catch(err => {
            console.log("error creating a new project", err);
            res.status(500).json({
                message: "error creating a new project",
                error: err
            });
        })
});



// GET /api/projects -  Retrieves all of the projects
router.get('/projects', (req, res, next) => {
    Project.find()
        .populate("tasks")
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            console.log("error getting list of projects", err);
            res.status(500).json({
                message: "error getting list of projects",
                error: err
            });
        })
});


router.get('/projects/:projectId', (req, res, next) => {
    
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }


    Project.findById(projectId)
        .populate('tasks')
        .then(project => res.json(project))
        .catch(err => {
            console.log("error getting details of a project", err);
            res.status(500).json({
                message: "error getting details of a project",
                error: err
            });
        })
});



// PUT /api/projects/:projectId  -  Updates a specific project by id
router.put('/projects/:projectId', isAuthenticated ,(req, res, next) => {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }

    const newDetails = {
        title: req.body.title,
        description: req.body.description,
        tasks: req.body.tasks
    }

    Project.findByIdAndUpdate(projectId, newDetails, { new: true })
        .then((updatedProject) => res.json(updatedProject))
        .catch(err => {
            console.log("error updating project", err);
            res.status(500).json({
                message: "error updating project",
                error: err
            });
        })
});



// DELETE /api/projects/:projectId  -  Delete a specific project by id
router.delete('/projects/:projectId', isAuthenticated ,(req, res, next) => {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }

    Project.findByIdAndRemove(projectId)
        .then(deteletedProject => {
            return Task.deleteMany({ _id: { $in: deteletedProject.tasks } });
        })
        .then(() => res.json({ message: `Project with id ${projectId} & all associated tasks were removed successfully.` }))
        .catch(err => {
            console.log("error deleting project", err);
            res.status(500).json({
                message: "error deleting project",
                error: err
            });
        })
});



module.exports = router;
