const express = require("express");
const mysql = require("mysql2/promise"); // Using mysql2/promise for async/await
const path = require("path"); // For path manipulation
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const multer = require('multer')
const fs = require("fs");
const { Sequelize, DataTypes } = require('sequelize');
const session = require('express-session');

dotenv.config({ path: "./.env" }); // Load environment variables securely

const dbConfig = {
  host: process.env.DatabaseHost,
  user: process.env.DatabaseUser,
  password: process.env.DatabasePass,
  database: process.env.Database,
};

(async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log("MySQL connected successfully!");

    const app = express();
    const port = process.env.PORT || 5001; // Use environment variable for port or default to 5001

    app.use(bodyParser.urlencoded({ extended: true })); // Parse form data

    // Set the views directory for serving HTML files (security-conscious approach)
    const viewsDir = path.join(__dirname, "./views");
    app.set("views", viewsDir);

    // Serve static assets (CSS, JavaScript, etc.) from a separate directory (optional)
    // You can create a 'public' folder for static assets and uncomment the following:
    app.use(express.static(path.join(__dirname, "public")));

    // Your routes here
    app.get("/Home", (req, res) => {
      // Render the 'proj.html' file directly
      const filePath = path.join(__dirname, "public", "index.html");
      res.sendFile(filePath); // Send the HTML file
    });

      // Session configuration (modify based on your needs)
app.use(session({
  secret: 'your_secret_key', // Replace with a secure secret key
  resave: false,
  saveUninitialized: true,
}));

    //it is for cheking the login ;
    //

    const storage = multer.diskStorage({
      destination: "../Uploaded", // Set the destination directory for uploaded files
      filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`); // Create unique filenames
      }
    });
    
    const upload = multer({ dest: '../Uploaded' });
    
   


    const uploadsFolderPath = '../Uploaded'; // Replace with the actual path to your uploaded folder

app.use(express.static('public'));

app.get('/files', (req, res) => {
  fs.readdir(uploadsFolderPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json(files);
  });
});

app.delete('/delete/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsFolderPath, filename);

  // Delete the file
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.sendStatus(200); // File deleted successfully
  });
});




// app.delete('/api/users/:userId', async (req, res) => {
//   try {
//     const userId = req.params.userId;

//     const sql = `DELETE FROM user WHERE UserID = ?`;
//     const [deleteResult] = await connection.execute(sql, [userId]);

//     if (deleteResult.affectedRows === 0) {
//       return res.status(404).send({ message: 'User not found' });
//     }

//     res.status(200).send({ message: 'User deleted successfully' });
//   } catch (error) {
//     console.error("Error deleting user:", error);
//     res.status(500).send({ message: 'Internal server error' });
//   }
// });


    app.get("/login", (req, res) => {
      const filePath = path.join(__dirname, "public","Home" ,"proj.html");
      res.sendFile(filePath); // Send the HTML file
    });
    app.get("/test", (req, res) => {
      const filePath = path.join(__dirname, "public","Testing" ,"test.html");
      console.log(filePath);
      res.sendFile(filePath); // Send the HTML file
    });
    app.get("/addEvent", (req, res) => {
      const filePath = path.join(__dirname, "public","AddEvent" ,"Event.html");
      console.log(filePath);
      res.sendFile(filePath); // Send the HTML file
    });

      // it is for the after login 
    app.get("/main", (req, res) => {
      const filePath = path.join(__dirname, "public", "sidebar-menu-submenus","navbar.html");
      res.sendFile(filePath); // Send the HTML file
    });

    // Other routes...

    // Registration route
    app.post('/register', async (req, res) => {
      const { name, email, password, leader } = req.body;
      console.log(name);
      console.log(email);
      console.log(password);
      console.log(leader);
    
      // Secure password hashing with bcrypt
      const saltRounds = 10; // Adjust salt rounds as needed
      try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
    
        // Prepare insert statement
        const insertSql = `
          INSERT INTO Users (Name, Username, Password, Role, LeaderID, Status)
          VALUES (?, ?, ?, 'Member', ?, 'Active')
        `;
    
        // Prepare select statement (optional, only if leader is provided)
        const selectSql = `
          SELECT UserID FROM Users WHERE Name = ?
        `;
    
        // Execute insert statement
        let result;
        if (leader) {
          // If leader is provided, fetch UserID
          const [selectResult] = await connection.execute(selectSql, [leader]);
          if (selectResult.length > 0) {
            const leaderID = selectResult[0].UserID;
            result = await connection.execute(insertSql, [name, email, hashedPassword, leaderID]);
          } else {
            // Handle case where leader name doesn't exist
            console.error("Invalid leader name:", leader);
            return res.status(400).send("Invalid leader name.");
          }
        } else {
          // If leader is not provided, set LeaderID to NULL
          result = await connection.execute(insertSql, [name, email, hashedPassword, null]);
        }
    
        if (result.affectedRows === 1) {
          // Redirect to login page after successful registration
          res.redirect(303, "/login");
        } else {
          console.error("Error registering user:", result); // Log specific details
          res.status(500).send("Registration failed. Please try again."); // Generic error message for user
        }
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          // If the error is due to duplicate entry, send a message to the client
          res.status(400).send('User already exists. Please choose a different email.');
        } else {
          console.error("Error during registration:", err);
          res.status(500).send("Registration failed. Please try again."); // Generic error message for user
        }
      }
    });

  // Define the User model

  const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    dialect: 'mysql'
  });

// Define the User model
const User = sequelize.define('User', {
  Name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Role: {
    type: DataTypes.ENUM('Leader', 'Member'),
    allowNull: false
  },
  Status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active'
  }
});

// (Connect to database and handle errors)
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful');
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1); // Exit the application on error
  }
})();

// Retrieve names of leaders from the database
app.get('/api/leaders', async (req, res) => {
  try {
    const leaders = await User.findAll({
      where: {
        Role: 'Leader'
      },
      attributes: ['Name'] // Select only the 'Name' column
    });
    const leaderNames = leaders.map(leader => leader.Name);
    res.json(leaderNames);
  } catch (error) {
    console.error('Error retrieving leader names:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

    // Login route


// ... other routes and middleware

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Please provide email and password");
  }

  try {
    const sql = `SELECT * FROM users WHERE Username = ?`;
    const [rows] = await connection.execute(sql, [email]);

    if (rows.length === 0) {
      return res.status(401).send("Invalid email"); // More specific message
    }

    const user = rows[0];

    if (user.Password) { // Ensure user.password exists before comparison
      const isPasswordValid = await bcrypt.compare(password, user.Password);

      if (isPasswordValid) {
        // Login successful, store user data in session
        const leaderId = user.UserID; // Assuming UserID is the leader's ID
        req.session.user = { username: user.Username, leaderId }; // Example session data (modify based on your needs)
        console.log("Session user:", req.session.user); 
        
        // Redirect to main page or handle success based on your application
        res.redirect('/main'); // Replace with appropriate response
      } else {
        res.status(401).send("Invalid password");
      }
    } else {
      console.error("User has no password:", user);
      // Consider logging additional details and potentially a more specific error message to user
      res.status(401).send("Login failed"); // Handle unexpected case
    }
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).send("Login failed"); // Handle unexpected errors
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const loggedInUser = await  req.session.user; // Assuming you have user data in session
    console.log(loggedInUser);
    if (!loggedInUser) {
      return res.status(401).send({ message: "Unauthorized: Please login" }); // Handle unauthorized access
    }
   
    const leaderId = loggedInUser.leaderId ;
    console.log(leaderId);
    const sql = `
      SELECT UserId, Name, Username
      FROM users
      WHERE LeaderID = ?;
    `;
    
    const [rows] = await connection.execute(sql, [leaderId]);
    console.log(rows);
    res.json(rows); // Send user data as JSON response
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send({ message: "Internal server error" }); // Handle error gracefully
  }
});
    
 //Endpoint to retrieve event details
 app.get('/events', async (req, res) => {
  try {    
// Retrieve the currently logged-in user's ID from session or token
const loggedInUserID = await req.session.user; // Example, use your actual method
console.log(loggedInUserID.leaderId);
    // Query to fetch event details from the database
    const sql = `
    SELECT e.*,u.Name 
    FROM events e
    INNER JOIN users u ON e.UserID = u.UserID
    WHERE u.LeaderID = ?`;

    const [eventsResult] = await connection.execute(sql, [loggedInUserID.leaderId]);
// Group events by user
const eventsByUser = {};
eventsResult.forEach(event => {
  const userID = event.UserID;
  if (!eventsByUser[userID]) {
    eventsByUser[userID] = [];
  }
  eventsByUser[userID].push(event);
});
console.log(eventsByUser);
    // Send the event details as JSON response
    res.json(eventsByUser);
  } catch (error) {
    console.error('Error fetching event details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

 // Route for handling file upload
 app.post('/upload', upload.single('document'), async (req, res) => {
  const { documentName, eventID } = req.body;
 // const documentFile = req.file;
  const user1= await req.session.user;
  console.log(user1);
  const uploadedBy = await user1.leaderId;
  const documentLocation = `../Uploaded/${documentName}`; 
 console.log(documentName);
 console.log(eventID);
 console.log(documentLocation);
 console.log(uploadedBy);
  // Check if all required fields are provided
  if (!documentName || !eventID ) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // // Read the uploaded file and convert it to a Buffer
    // const fileData = await fs.promises.readFile(document.path);

    // Store the file in the database
const [result] = await connection.execute(
  'INSERT INTO documents (EventID, DocumentName, DocumentLocation, UploadedBy) VALUES (?, ?, ?, ?)',
  [eventID, documentName, documentLocation, uploadedBy]
);

    

    // Send success response
    res.status(200).json({ message: 'Document uploaded successfully.' });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ message: 'An error occurred while uploading the document.' });
  }
});

// Route to fetch and display documents
app.get("/leader/documents", async (req, res) => {
  try {
    const leaderId = req.session.user.leaderId; // Assuming the leader ID is stored in session
    const [rows] = await connection.query(
      `SELECT e.*,u.Name 
      FROM documents e
      INNER JOIN users u ON e.UploadedBy = u.UserID
      WHERE u.UserID = 1;`,
      [leaderId]
    );
    console.log(rows);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

    app.listen(port, () => console.log(`Server listening on port ${port}`));
  } catch (err) {
    console.error("Error connecting to database or starting server:", err);
    // Handle errors gracefully (e.g., terminate app, retry connection)
  }
})();
