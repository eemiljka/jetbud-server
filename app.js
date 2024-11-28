import express from "express";

import { getExpenseById, getExpenses, addExpense } from "./database.js";

const app = express();

app.use(express.json());

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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
