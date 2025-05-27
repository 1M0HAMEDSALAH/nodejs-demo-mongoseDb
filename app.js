console.log("welcome to js");
// const logger = require("./logger.js");
const express = require("express");
const morgan = require("morgan");
const productsRoutes = require("./api/routes/products.js");
const ordersRoutes = require("./api/routes/orders.js");
const tasksRoutes = require("./api/routes/tasks.js");
const authRoutes = require("./api/routes/authes.js");
const userDataRoutes = require("./api/routes/profile.js");
const bobyParser = require("body-parser");
const app = express();
// mongodb+srv://mohamedsalahxv80:<db_password>@cluster0.rhxuz8m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
// mongodb+srv://mohamedsalahxv80: pass == ryyNwgbPenLoAFfV
const mongoose = require("mongoose");
mongoose.connect('mongodb+srv://mohamedsalahxv80:mohamedsalahxv80@cluster0.rhxuz8m.mongodb.net/usersDB?retryWrites=true&w=majority&appName=Cluster0')
.then(() => {
    console.log("connected to mongodb");
}).catch((err) => {
    console.log("error connecting to mongodb", err);
});

app.use(morgan("dev"));
app.use(bobyParser.urlencoded({ extended: false }));
app.use(bobyParser.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if(req.method === "OPTIONS"){
        res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
        return res.status(200).json({});
    }
    next();
});



app.use("/products", productsRoutes);

app.use("/orders", ordersRoutes);

app.use("/tasks", tasksRoutes);

app.use("/auth", authRoutes);

app.use("/User", userDataRoutes);


app.use((req,res,next)=>{
    const error = new Error("Not Found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});


module.exports = app;





// const books = [
//     {
//         id: 1,
//         name: "book 1"
//     },
//     {
//         id: 2,
//         name: "book 2"
//     },
//     {
//         id: 3,
//         name: "book 3"
//     },
//     {
//         id: 4,
//         name: "book 4"
//     },
// ]

// const server = http.createServer((req,res)=>{
//     if(req.url === "/"){
//         res.write("<h1>Welcome to node js</h1>");
//         res.end();
//     }
//     if(req.url === "/api/books"){
//         res.write(JSON.stringify(books));
//         res.end();
//     }
// });
// server.listen(5000, () => console.log("server list on port 5000"));