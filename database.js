import mysql from "mysql2";

// Dotenv config to read enviroment variables from .env file
import dotenv from "dotenv";
dotenv.config();

// Create a mysql connection pool
const pool = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  })
  .promise();

export default pool;

/******** EXPENSES ********/

// Function to get all expenses from the database
async function getExpenses() {
  const [rows] = await pool.query(
    "SELECT expense_id, description, CAST(expense_sum AS DECIMAL(10,2)) AS expense_sum FROM expenses"
  );
  return rows;
}

// Function to get an expense by id from the database
async function getExpenseById(id) {
  const [rows] = await pool.query(
    "SELECT expense_id, description, CAST(expense_sum AS DECIMAL(10,2)) AS expense_sum FROM expenses WHERE expense_id = ?",
    [id]
  );
  return rows[0];
}

// Function to add an expense to the database
async function addExpense(description, expense_sum) {
  const [result] = await pool.query(
    "INSERT INTO expenses (description, expense_sum) VALUES (?, ?)",
    [description, expense_sum]
  );
  const id = result.insertId;
  return await getExpenseById(id);
}

// Function to delete an expense from the database
async function deleteExpense(id) {
  const [result] = await pool.query(
    "DELETE FROM expenses WHERE expense_id = ?",
    [id]
  );
  return result;
}

// Function to update an expense in the database
async function updateExpense(id, description, expense_sum) {
  const [result] = await pool.query(
    "UPDATE expenses SET description = ?, expense_sum = ? WHERE expense_id = ?",
    [description, expense_sum, id]
  );
  return result;
}

/******** ASSETS ********/

// Function to get all assets from the database
async function getAssets() {
  const [rows] = await pool.query(
    "SELECT asset_id, description, CAST(asset_sum AS DECIMAL(10,2)) AS asset_sum FROM assets"
  );
  return rows;
}

export {
  getExpenses,
  addExpense,
  getExpenseById,
  deleteExpense,
  updateExpense,
  getAssets,
};
