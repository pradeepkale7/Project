const bcrypt = require('bcrypt');

const password = "Vinit@123";
const saltRounds = 10;  // Adjust salt rounds as needed

bcrypt.hash(password, saltRounds)
  .then(hashedPassword => {
    console.log("Hashed password:", hashedPassword);
    // Use this hashedPassword for insertion in MySQL Workbench
  })
  .catch(error => console.error(error));

  
