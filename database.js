import mysql from "mysql2";

import dotenv from "dotenv";
dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  })
  .promise();

async function getExpenses() {
  const [rows] = await pool.query("SELECT * FROM expenses");
  return rows;
}

async function getExpenseById(id) {
  const [rows] = await pool.query(
    "SELECT * FROM expenses WHERE expense_id = ?",
    [id]
  );
  return rows[0];
}

async function addExpense(description, expense_sum) {
  const [result] = await pool.query(
    "INSERT INTO expenses (description, expense_sum) VALUES (?, ?)",
    [description, expense_sum]
  );
  const id = result.insertId;
  return await getExpenseById(id);
}

export { getExpenses, addExpense, getExpenseById };
