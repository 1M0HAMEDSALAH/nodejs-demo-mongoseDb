// console.log("welcome to js");
// // const logger = require("./logger.js");
// const express = require("express");
// const morgan = require("morgan");
// const productsRoutes = require("./api/routes/products.js");
// const ordersRoutes = require("./api/routes/orders.js");
// const tasksRoutes = require("./api/routes/tasks.js");
// const authRoutes = require("./api/routes/authes.js");
// // const userDataRoutes = require("./api/routes/profile.js");
// const bobyParser = require("body-parser");
// const app = express();
// // mongodb+srv://mohamedsalahxv80:<db_password>@cluster0.rhxuz8m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
// // mongodb+srv://mohamedsalahxv80: pass == ryyNwgbPenLoAFfV
// const mongoose = require("mongoose");
// mongoose.connect('mongodb+srv://mohamedsalahxv80:mohamedsalahxv80@cluster0.rhxuz8m.mongodb.net/usersDB?retryWrites=true&w=majority&appName=Cluster0')
// .then(() => {
//     console.log("connected to mongodb");
// }).catch((err) => {
//     console.log("error connecting to mongodb", err);
// });

// app.use(morgan("dev"));
// app.use(bobyParser.urlencoded({ extended: false }));
// app.use(bobyParser.json());
// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header(
//         "Access-Control-Allow-Headers",
//         "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//     );
//     if(req.method === "OPTIONS"){
//         res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
//         return res.status(200).json({});
//     }
//     next();
// });



// app.use("/products", productsRoutes);

// app.use("/orders", ordersRoutes);

// app.use("/tasks", tasksRoutes);

// app.use("/auth", authRoutes);

// // app.use("/User", userDataRoutes);


// app.use((req,res,next)=>{
//     const error = new Error("Not Found");
//     error.status = 404;
//     next(error);
// });

// app.use((error, req, res, next) => {
//     res.status(error.status || 500);
//     res.json({
//         error: {
//             message: error.message
//         }
//     });
// });


// module.exports = app;


require("dotenv").config();
const express = require("express");
const config = require("./config");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const userModel = require("./api/models/user");
const jwt = require("jsonwebtoken");
const user = require("./api/models/user");
const Note = require("./api/models/note");
const { authenticateToken } = require("./utilities");
const swaggerRoutes = require("./server");

app.use(express.json()); // 🟢 مهم جداً
app.use(cors({ origin: "*" }));

// Connect to MongoDB
mongoose.connect(config.connectionString);

// Home route
app.use("/", swaggerRoutes);

// app.get("/", (req, res) => {
//   res.status(200).json({
//     success: "Success",
//     message: "Welcome to the API"
//   });
// });

// Create account route
app.post("/Create-account", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: "Error",
      error: "Username, email, and password are required"
    });
  }

  try {
    const existingUser = await user.findOne({ email });
    const existingUserUser = await user.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: "Error",
        error: "Email already in use"
      });
    }
    if (existingUserUser) {
      return res.status(400).json({
        success: "Error",
        error: "username already in use"
      });
    }

    const newUser = new userModel({ username, email, password });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "3600m" }
    );

    return res.status(200).json({
      success: "Success",
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: err.message
    });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
if( !email || !password) {
    return res.status(400).json({
      success: "Error",
      error: "Email and password are required"
    });
  }
  const UserInfo = await user.findOne({ email });
  if (!UserInfo) {
    return res.status(400).json({
      success: "Error",
      error: "Invalid email or password"
    });
  }
  if (UserInfo.password == password && UserInfo.email == email) {
    const user = {user: UserInfo};
    const token = jwt.sign(user, process.env.JWT_SECRET,{expiresIn: "3600m"});
    res.status(200).json({
      success: "Success",
      message: "Login successful",
      token,
      email
    });
  }
  else {
    return res.status(400).json({
      success: "Error",
      error: "Invalid email or password"
    });
  }

});

// Reset-Password
app.put("/Reset-Password", authenticateToken, async (req, res) => {
  const { newPassword } = req.body;
  const userId = req.user.userId; // لازم يكون موجود من التوكن

  if (!newPassword) {
    return res.status(400).json({
      success: false,
      error: "New password is required"
    });
  }

  try {
    const user = await userModel.findOne(userId);  
    if (!user) {
      return res.status(404).json({
        success: "Error",
        error: "User not found"
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: "Success",
      message: "Password reset successfully"
    });
  } catch (err) {
    console.error("Reset Password error:", err);
    res.status(500).json({
      success: "Error",
      error: "Internal server error",
      details: err.message
    });
  }
});

// Add-Note
app.post("/Add-Note", authenticateToken, async (req, res) => {
const { title, content ,tags} = req.body;
const {user} = req.user;

if (!title || !content) {
    return res.status(400).json({
      success: "Error",
      error: "Title and content are required"
    });
  }
  
  try {
    const newNote = new Note({
      title,
      content,
      tags,
      userId: user._id
    });
    await newNote.save();

    res.status(200).json({
      success: "Success",
      message: "Note added successfully",
      newNote
    });
  } catch (err) {
    console.error("Add Note error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: err.message
    });
  }
});

// edit-Notes
app.put("/Edit-Note/:id", authenticateToken, async (req, res) => {
  const { title, content, tags , isPinned} = req.body;
  const noteId = req.params.id; 
  const { user } = req.user;

    if (!title && !content && !tags) {
        return res.status(400).json({
        success: "Error",
        error: "No fields to update provided"
        });
    }
    try{
        const note = await Note.findOne({ _id: noteId, userId: user._id });
        if (!note) {
            return res.status(404).json({
                success: "Error",
                error: "Note not found"
            });
        }

        if (title) note.title = title;
        if (content) note.content = content;
        if (tags) note.tags = tags;
        if (isPinned) note.isPinned = isPinned;

        await note.save();

        res.status(200).json({
            success: "Success",
            message: "Note updated successfully",
            note
        });
    } catch (err) {
         res.status(500).json({
            success: false,
            error: "Internal server error",
            details: err.message
        });
    }
});

// get-all-Notes
app.get("/Get-All-Notes", authenticateToken, async (req, res) => {
  const { user } = req.user;

  try {
    const notes = await Note.find({ userId: user._id });
    if (notes.length === null || notes.length === 0) {
      return res.status(200).json({
        success: "Scuccess",
        message: "No notes found",
        notes: []
      });
    }
    res.status(200).json({
      success: "Success",
      notes
    });
  } catch (err) {
    res.status(500).json({
      success: "Error",
      error: "Internal server error",
      details: err.message
    });
  }
});

// query-Notes
app.get("/Query-Notes", authenticateToken, async (req, res) => {
  const { user } = req.user;
  const { title, tags , createdAt} = req.query;

  try {
    const query = { userId: user._id };
    if (createdAt) 
        query.createdAt = { $gte: new Date(createdAt) };
    if (title) query.title = new RegExp(title, "i");
    if (tags) query.tags = { $in: tags.split(",") };

    const notes = await Note.find(query);
    if (notes.length === 0) {
      return res.status(200).json({
        success: "Success",
        message: "No notes found matching the criteria",
        notes: []
      });
    }
    res.status(200).json({
      success: "Success",
      notes
    });
  } catch (err) {
    res.status(500).json({
      success: "Error",
      error: "Internal server error",
      details: err.message
    });
  }
});

// delete-Note
app.delete("/Delete-Note/:id", authenticateToken, async (req, res) => {
  const noteId = req.params.id;
  const { user } = req.user;

  try {
    const note = await Note.findOneAndDelete({ _id: noteId, userId: user._id });
    if (!note) {
      return res.status(404).json({
        success: "Error",
        error: "Note not found"
      });
    }
    res.status(200).json({
      success: "Success",
      message: "Note deleted successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: "Error",
      error: "Internal server error",
      details: err.message
    });
  }
});

// Update-isPinned-Notes
app.put("/Update-isPinned-Note/:id", authenticateToken, async (req, res) => {
  const { isPinned} = req.body;
  const noteId = req.params.id; 
  const { user } = req.user;
    try{
        const note = await Note.findOne({ _id: noteId, userId: user._id });
        if (!note) {
            return res.status(404).json({
                success: "Error",
                error: "Note not found"
            });
        }
        note.isPinned = isPinned;

        await note.save();

        res.status(200).json({
            success: "Success",
            message: "Note updated successfully",
            note
        });
    } catch (err) {
         res.status(500).json({
            success: false,
            error: "Internal server error",
            details: err.message
        });
    }
});

// Get-User
app.get("/Get-User", authenticateToken, async (req, res) => {
  const { user } = req.user;

  try {
    const userInfo = await userModel.findOne({_id: user._id}).select("-password"); // Exclude password from response
    if (!userInfo) {
      return res.status(404).json({
        success: "Error",
        error: "User not found"
      });
    }
    res.status(200).json({
      success: "Success",
      userInfo
    });
  } catch (err) {
    res.status(500).json({
      success: "Error",
      error: "Internal server error",
      details: err.message
    });
  }
});



app.listen(8000, "192.168.1.9" , () => {
  console.log("Server running on port 8000");
});

module.exports = app;


/**
 * @swagger
 * /Create-account:
 *   post:
 *     summary: Create a new user account
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */

// Login
/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     tags: 
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid email or password
 */

// Reset Password
/**
 * @swagger
 * /Reset-Password:
 *   post:
 *     summary: User Reset-Password
 *     tags: 
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Newpassword
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset-Password successful
 *       400:
 *         description: Invalid email or password
 */
/**
 * @swagger
 * /Add-Note:
 *   post:
 *     summary: Add a new note
 *     tags:
 *       - Notes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Note added successfully
 *       400:
 *         description: Title and content are required
 */

/**
 * @swagger
 * /Edit-Note/{id}:
 *   put:
 *     summary: Edit a note by ID
 *     tags:
 *       - Notes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Note ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isPinned:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Note updated successfully
 *       400:
 *         description: No fields to update provided
 *       404:
 *         description: Note not found
 */

/**
 * @swagger
 * /Get-All-Notes:
 *   get:
 *     summary: Get all notes for the authenticated user
 *     tags:
 *       - Notes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notes retrieved successfully
 *       400:
 *         description: No notes found
 */
/**
 * @swagger
 * /Query-Notes:
 *   get:
 *     summary: Query notes by title or tags
 *     description: Retrieve notes based on title or tags. If both are provided, it will filter by both criteria.
 *     tags:
 *       - Notes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: createdAt
 *         schema:
 *           type: Date
 *         required: false
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         required: false
 *         description: Title of the note (partial match, case-insensitive)
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         required: false
 *         description: Comma-separated list of tags (e.g. work,personal,important)
 *     responses:
 *       200:
 *         description: Notes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                 notes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Note'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /Delete-Note/{id}:
 *   delete:
 *     summary: Delete a note by ID
 *     tags:
 *       - Notes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Note ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Note deleted successfully
 *       404:
 *         description: Note not found
 */

/**
 * @swagger
 * /Update-isPinned-Note/{id}:
 *   put:
 *     summary: Update the pinned status of a note
 *     tags:
 *       - Notes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Note ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isPinned
 *             properties:
 *               isPinned:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Note updated successfully
 *       404:
 *         description: Note not found
 */

/**
 * @swagger
 * /Get-User:
 *   get:
 *     summary: Get user information
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User info retrieved
 *       404:
 *         description: User not found
 */
