const express = require("express");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const Task = require("./model/task");
const methodOverride = require('method-override')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"))

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/TaskProject", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
    console.log("Database connection successful");
})
.catch(err => {
    console.error("Database connection error:", err);
});

// home route to display all the tasks
app.get("/home", async (req, res) => {
    try {
        const tasks = await Task.find({});
        res.render("home", { tasks });
    } catch (err) {
        console.error("Error fetching tasks:", err);
        res.status(500).send("Internal Server Error");
    }
});

// add a new task route
app.get("/add", (req, res) => {
    res.render("add");
});

// post request to add a new task
app.post("/home", async(req, res) => {
    const {title, description, dueDate} = req.body;
    const newTask = new Task({
        title : title,
        description : description,
        dueDate : dueDate
    });

    await newTask.save();
    console.log("Task saved successfully:", newTask);
    res.redirect("/home")
});

// edit route
app.get("/:id/edit", async(req, res) => {
    const {id} = req.params;
    const task = await Task.findById(id);
    const formatDueDate = task.dueDate.toISOString().substring(0, 10);
    res.render("edit", { task, formatDueDate});
});

app.put("/:id/view", async(req, res) => {
    try {
        const { id } = req.params;
        
        // Update the task and return the updated document
        const taskUpdate = await Task.findByIdAndUpdate(id, req.body, { new: true });
        
        // Redirect to the show route with the updated task ID
        res.redirect(`/${taskUpdate._id}/view`);
    } catch (err) {
        console.error("Error updating task:", err);
        res.status(500).send("Internal Server Error");
    }
})


// view the task route
app.get("/:id/view", async(req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        res.render("show", { task });
    } catch (err) {
        console.error("Error fetching task:", err);
        res.status(500).send("Internal Server Error");
    }
});

// delete the task route
app.delete("/:id/delete", async(req, res) => {
    const {id} = req.params;
    const deleteTask = await Task.findByIdAndDelete(id);
    console.log("Deleted Task ", deleteTask)
    res.redirect("/home")
})

// for all other routes, handle the error
app.all("*", (req, res) => {
    res.send("Error");
});

app.listen(3000, () => {
    console.log("Listening on port 3000");
});

