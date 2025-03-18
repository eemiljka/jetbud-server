import express from "express";
import {
  getExpenseById,
  getExpenses,
  addExpense,
  deleteExpense,
  updateExpense,
  getAssets,
  getAssetById,
  addAsset,
  deleteAsset,
  updateAsset,
} from "./database.js";
import jwt from "jsonwebtoken";
import pool from "./database.js";
import cors from "cors";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { verifyToken } from "./middleware/auth.js";

dotenv.config();
const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(cors());

// CORS options
const corsOptions = {
  origin: "http://localhost:8080",
  optionSuccessStatus: 200,
};

/******** AUTHENTICATION ********/

// Register
app.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!(username && password && email)) {
      return res.status(400).send("All input is required");
    }

    const [old] = await pool.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (old.length > 0) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, encryptedPassword]
    );

    // Query the newly inserted user
    const [newUserRows] = await pool.query(
      "SELECT * FROM users WHERE user_id = ?",
      [result.insertId]
    );
    const newUser = newUserRows[0];

    // Create token using the correct user object
    const token = jwt.sign(
      { user_id: newUser.user_id, email: newUser.email },
      process.env.TOKEN_KEY,
      { expiresIn: "2h" }
    );
    newUser.token = token;
    newUser.password = undefined; // remove password before sending

    res.status(201).json(newUser);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!(username && password)) {
      return res.status(400).send("All input is required");
    }

    const [users] = await pool.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (users.length > 0) {
      const user = users[0];
      const validPassword = await bcrypt.compare(password, user.password);
      if (validPassword) {
        const token = jwt.sign(
          { user_id: user.user_id, email: user.email },
          process.env.TOKEN_KEY,
          { expiresIn: "2h" }
        );
        user.token = token;
        user.password = undefined;
        return res.status(200).json(user);
      }
      return res.status(400).send("Invalid Credentials");
    } else {
      return res.status(400).send("User not found");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

// Logout
app.post("/logout", verifyToken, (req, res) => {
  return res.status(200).json({ message: "Successfully logged out" });
});

// Verify Token
app.get("/tokenIsValid", cors(corsOptions), verifyToken, (req, res) => {
  res.status(200).send("Token is valid");
});

/******* EXPENSES ROUTES *******/

// Get all expenses for the logged-in user
app.get("/expenses", verifyToken, (req, res) => {
  const userId = req.user.user_id;
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  getExpenses(userId)
    .then((expenses) => {
      if (expenses) {
        res.json(expenses);
      } else {
        res.status(404).send("Expenses not found");
      }
    })
    .catch((error) => {
      res.status(500).send("Server error");
    });
});

// Get expense by id (optional: add ownership check)
app.get("/expenses/:id", verifyToken, (req, res) => {
  getExpenseById(req.params.id).then((expense) => {
    if (expense) {
      res.json(expense);
    } else {
      res.status(404).send("Expense not found");
    }
  });
});

// Create a new expense for the logged-in user
app.post("/expenses", verifyToken, (req, res) => {
  const userId = req.user.user_id;
  const { description, expense_sum } = req.body;
  if (!description || !expense_sum) {
    return res.status(400).send("Description and expense sum are required");
  }
  addExpense(description, expense_sum, userId)
    .then((expense) => res.status(201).json(expense))
    .catch((err) => res.status(500).send("Server error"));
});

// Delete an expense (optionally, add check to ensure it belongs to req.user)
app.delete("/expenses/:id", verifyToken, (req, res) => {
  deleteExpense(req.params.id).then((result) => {
    if (result.affectedRows) {
      res.status(204).send();
    } else {
      res.status(404).send("Expense not found");
    }
  });
});

// Update an expense (optionally, add check to ensure it belongs to req.user)
app.put("/expenses/:id", verifyToken, (req, res) => {
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

/******* ASSETS ROUTES *******/
app.get("/assets", (req, res) => {
  getAssets().then((assets) => {
    res.json(assets);
  });
});

app.get("/assets/:id", (req, res) => {
  getAssetById(req.params.id).then((asset) => {
    if (asset) {
      res.json(asset);
    } else {
      res.status(404).send("Asset not found");
    }
  });
});

app.post("/assets", express.json(), (req, res) => {
  addAsset(req.body.description, req.body.asset_sum).then((asset) => {
    res.status(201).json(asset);
  });
});

app.put("/assets/:id", (req, res) => {
  updateAsset(req.params.id, req.body.description, req.body.asset_sum).then(
    (result) => {
      if (result.affectedRows) {
        res.status(204).send();
      } else {
        res.status(404).send("Asset not found");
      }
    }
  );
});

app.delete("/assets/:id", (req, res) => {
  deleteAsset(req.params.id).then((result) => {
    if (result.affectedRows) {
      res.status(204).send();
    } else {
      res.status(404).send("Asset not found");
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
