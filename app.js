import express, { response } from "express";

import {
  getExpenseById,
  getExpensesForUser,
  getAssetsForUser,
  addExpense,
  deleteExpense,
  updateExpense,
  getAssetById,
  addAsset,
  deleteAsset,
  updateAsset,
  getUserInfo,
  getExpensesYears,
  getExpensesMonths,
  getExpensesDays,
  getOneDaysExpenses,
  getOneMonthsExpenses,
  updateUsername,
  updatePassword,
} from "./database.js";
import jwt from "jsonwebtoken";
import pool from "./database.js";
import cors from "cors";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { verifyToken } from "./middleware/auth.js";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(cors());

// CORS options
const corsOptions = {
  origin: "http://localhost:8080",
  optionSuccessStatus: 200,
};

/******* ROUTES *******/

//  EXPENSES
app.get("/expenses", verifyToken, (req, res) => {
  const userId = req.user.user_id;
  getExpensesForUser(userId)
    .then((expenses) => res.json(expenses))
    .catch((err) => res.status(500).send("Server error"));
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

app.post("/expenses", verifyToken, express.json(), (req, res) => {
  const { description, expense_sum } = req.body;
  const userId = req.user.user_id;
  addExpense(description, expense_sum, userId)
    .then((expense) => res.status(201).json(expense))
    .catch((err) => res.status(500).send("Server error"));
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
app.get("/assets", verifyToken, (req, res) => {
  const userId = req.user.user_id;
  getAssetsForUser(userId)
    .then((expenses) => res.json(expenses))
    .catch((err) => res.status(500).send("Server error"));
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

app.post("/assets", verifyToken, express.json(), (req, res) => {
  const { description, asset_sum } = req.body;
  const userId = req.user.user_id;
  addAsset(description, asset_sum, userId)
    .then((asset) => res.status(201).json(asset))
    .catch((err) => res.status(500).send("Server error"));
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

/******** HISTORY ********/
app.get("/expense-years", verifyToken, (req, res) => {
  const userId = req.user.user_id;
  getExpensesYears(userId)
    .then((years) => res.json(years))
    .catch((err) => res.status(500).send("Server error"));
});

app.get("/expense-months", verifyToken, (req, res) => {
  const userId = req.user.user_id;
  const year = req.query.year;
  getExpensesMonths(userId, year)
    .then((months) => res.json(months))
    .catch((err) => res.status(500).send("Server error"));
});

app.get("/expense-days", verifyToken, (req, res) => {
  const userId = req.user.user_id;
  const month = req.query.month;
  getExpensesDays(userId, month)
    .then((days) => res.json(days))
    .catch((err) => res.status(500).send("Server error"));
});

app.get("/days-expenses", verifyToken, (req, res) => {
  const userId = req.user.user_id;
  const day = req.query.day;
  getOneDaysExpenses(userId, day)
    .then((daysExpenses) => res.json(daysExpenses))
    .catch((err) => res.status(500).send("Server error"));
});

app.get("/months-expenses", verifyToken, (req, res) => {
  const userId = req.user.user_id;
  const month = req.query.month;
  getOneMonthsExpenses(userId, month)
    .then((monthsExpenses) => monthsExpenses)
    .catch((err) => res.status(500).send("Server error"));
});

/******** USERS ********/

app.get("/user", verifyToken, (req, res) => {
  const userId = req.user.user_id;
  getUserInfo(userId)
    .then((userInfo) => res.json(userInfo))
    .catch((err) => res.status(500).send("Server error"));
});

// change username
app.put("/username", verifyToken, (req, res) => {
  const userId = req.user.user_id;
  const newUsername = req.body.username;

  if (!newUsername) {
    return res.status(400).send("New username is required");
  }

  updateUsername(newUsername, userId)
    .then((result) => {
      if (result.affectedRows) {
        res.json({ message: "Username updated successfully", newUsername });
      } else {
        res.status(404).send("User not found");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Server error");
    });
});

// change password
app.put("/password", verifyToken, (req, res) => {
  const userId = req.user.user_id;
  const newPassword = req.body.password;

  if (!newPassword) {
    res.status(400).send("New password is required");
  }

  updatePassword(newPassword, userId)
    .then((result) => {
      if (result.affectedRows) {
        res.json({ message: "Password updated successfully", newPassword });
      } else {
        res.status(404).send("User not found");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Server error");
    });
});

/******** AUTHENTICATION ********/

// Register
app.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!(username && password && email)) {
      res.status(400).send("All input is required");
    }
    const [old] = await pool.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (old.length > 0) {
      return res.status(409).send("User Already Exist. Please Login");
    }
    const encryptedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, encryptedPassword]
    );
    const token = jwt.sign(
      { user_id: result.insertId, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );

    const newUser = {
      user_id: result.insertId,
      username,
      email,
      token,
    };

    return res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      return res.status(400).send("All input is required");
    }
    const [users] = await pool.query(`SELECT * FROM users where email = ?`, [
      email,
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
      return res.status(400).send("User does not exist");
    }
  } catch (err) {
    console.error(err);
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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
