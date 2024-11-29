import express from "express";

import {
  getExpenseById,
  getExpenses,
  addExpense,
  deleteExpense,
  updateExpense,
} from "./database.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

/******* ROUTES *******/
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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
