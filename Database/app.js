const express = require("express");
const mysql = require("mysql2/promise"); // Using mysql2/promise for async/await
const path = require('path'); // For path manipulation
const dotenv = require("dotenv");

dotenv.config({ path: './.env' }); // Load environment variables securely

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

    // Set the views directory for serving HTML files (security-conscious approach)
    const viewsDir = path.join(__dirname, './views');
    app.set('views', viewsDir);

    // Serve static assets (CSS, JavaScript, etc.) from a separate directory (optional)
    // You can create a 'public' folder for static assets and uncomment the following:
     app.use(express.static(path.join(__dirname, 'public')));

    // Your routes here
    app.get("/", (req, res) => {
      // Render the 'proj.html' file directly
      const filePath =path.join(__dirname,'views','proj.html');
      res.sendFile(filePath); // Send the HTML file
    });
    

    // Other routes...

    app.listen(port, () => console.log(`Server listening on port ${port}`));
  } catch (err) {
    console.error("Error connecting to database or starting server:", err);
    // Handle errors gracefully (e.g., terminate app, retry connection)
  }
})();
