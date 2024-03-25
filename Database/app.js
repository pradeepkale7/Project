const express = require("express");
const mysql = require("mysql2/promise"); // Using mysql2/promise for async/await
const path = require("path"); // For path manipulation
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");


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

    //it is for cheking the login ;
    app.get("/Login", (req, res) => {
      const filePath = path.join(__dirname, "views", "proj.html");
      res.sendFile(filePath); // Send the HTML file
    });

    // Other routes...

    // Registration route
    app.post("/register", async (req, res) => {
      const { name, email, password } = req.body;

      // Basic validation (replace with more robust checks)
      if (!name || !email || !password) {
        return res.status(400).send("Please fill in all required fields");
      }

      // Secure password hashing with bcrypt (install with `npm install bcrypt`)
     
      const saltRounds = 10; // Adjust salt rounds as needed

      try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
        const [result] = await connection.execute(sql, [
          name,
          email,
          hashedPassword,
        ]);

        if (result.affectedRows === 1) {
            res.status(201).send("Registration successful!");
          res.redirect(303,"/Login");
        } else {
          res.status(500).send("Error registering user"); // Handle potential errors
        }
      } catch (err) {
        console.error("Error during registration:", err);
        res.status(500).send("Registration failed"); // Handle unexpected errors
      }
    });

    // Login route
    app.post("/login", async (req, res) => {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).send("Please provide email and password");
      }

      try {
        const sql = `SELECT * FROM users WHERE email = ?`;
        const [rows] = await connection.execute(sql, [email]);

        if (rows.length === 0) {
          return res.status(401).send("Invalid email or password"); // No user found
        }

        const user = rows[0];

        // Secure password comparison with bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
          // Login successful (consider creating a session or token for authentication)
         // res.send("Login successful!"); // Replace with appropriate response
          res.redirect('/Home');
        } else {
          res.status(401).send("Invalid email or password");
        }
      } catch (err) {
        console.error("Error during login:", err);
        res.status(500).send("Login failed"); // Handle unexpected errors
      }
    });

    app.listen(port, () => console.log(`Server listening on port ${port}`));
  } catch (err) {
    console.error("Error connecting to database or starting server:", err);
    // Handle errors gracefully (e.g., terminate app, retry connection)
  }
})();
