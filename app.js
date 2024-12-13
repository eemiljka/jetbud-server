import express from "express";

import {
  getExpenseById,
  getExpenses,
  addExpense,
  deleteExpense,
  updateExpense,
  getAssets,
} from "./database.js";
import jwt from "jsonwebtoken";
import pool from "./database.js";
import cors from "cors";
import bcrypt from "bcrypt";

const app = express();

app.use(express.json());
app.use(cors());

/******* ROUTES *******/

//  EXPENSES
app.get("/expenses", (req, res) => {
  getExpenses().then((expenses) => {
    res.json(expenses);
  });
});

app.get("/expenses/:id", (req, res) => {
  getExpenseById(req.params.id).then((expense) => {
    if (expense) {
      res.json(expense);
    } else {
      res.status(404).send("Expense not found");
    }
  });
});

app.post("/expenses", express.json(), (req, res) => {
  addExpense(req.body.description, req.body.expense_sum).then((expense) => {
    res.status(201).json(expense);
  });
});

app.delete("/expenses/:id", (req, res) => {
  deleteExpense(req.params.id).then((result) => {
    if (result.affectedRows) {
      res.status(204).send();
    } else {
      res.status(404).send("Expense not found");
    }
  });
});

app.put("/expenses/:id", (req, res) => {
  updateExpense(req.params.id, req.body.description, req.body.expense_sum).then(
    (result) => {
      if (result.affectedRows) {
        res.status(204).send();
      } else {
        res.status(404).send("Expense not found");
      }
    }
  );
});

// ASSETS
app.get("/assets", (req, res) => {
  getAssets().then((assets) => {
    res.json(assets);
  });
});

/******** AUTHENTICATION ********/

// AUTHENTICATION
// Register
app.post("/register", async (req, res) => {
  // TODO: Implement user registration
  try {
    // Get user input
    const { username, password, email } = req.body;

    // Validate user input
    if (!(username && password && email)) {
      res.status(400).send("All input is required");
    }

    // Check if user already exists
    // Validate if user exists in our database
    const [old] = await pool.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (old.length > 0) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    // Encrypt user password
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await pool.query(
      " INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, encryptedPassword]
    );

    // Create token
    const token = jwt.sign(
      { user_id: user.user_id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    user.token = token;

    // Remove password from response
    user.password = "";

    // Return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});

// Login
app.post("/login", (req, res) => {
  // TODO: Implement user login
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
