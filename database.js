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
async function getExpensesForUser(user_id) {
  const [rows] = await pool.query(
    `SELECT expense_id, description, CAST(expense_sum AS DECIMAL(10,2)) AS expense_sum FROM expenses WHERE user_id = ?`,
    [user_id]
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
async function addExpense(description, expense_sum, user_id) {
  const [result] = await pool.query(
    "INSERT INTO expenses (description, expense_sum, user_id) VALUES (?, ?, ?)",
    [description, expense_sum, user_id]
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
async function getAssetsForUser(user_id) {
  const [rows] = await pool.query(
    `SELECT asset_id, description, CAST(asset_sum AS DECIMAL(10,2)) AS asset_sum FROM assets WHERE user_id = ?`,
    [user_id]
  );
  return rows;
}

async function getAssetById(id) {
  const [rows] = await pool.query(
    "SELECT asset_id, description, CAST(asset_sum AS DECIMAL (10,2)) AS asset_sum FROM assets WHERE asset_id = ?",
    [id]
  );
  return rows[0];
}

async function addAsset(description, asset_sum, user_id) {
  const [result] = await pool.query(
    "INSERT INTO assets (description, asset_sum, user_id) VALUES (?, ?, ?)",
    [description, asset_sum, user_id]
  );
  const id = result.insertId;
  return await getAssetById(id);
}

async function deleteAsset(id) {
  const [result] = await pool.query("DELETE FROM assets WHERE asset_id = ?", [
    id,
  ]);
  return result;
}

async function updateAsset(id, description, asset_sum) {
  const [result] = await pool.query(
    "UPDATE assets SET description = ?, asset_sum = ? WHERE asset_id = ?",
    [description, asset_sum, id]
  );
  return result;
}

/******** USERS ********/
async function getUserInfo(user_id) {
  const [rows] = await pool.query(
    `SELECT username, email FROM users WHERE user_id = ?`,
    [user_id]
  );
  console.log(rows);
  return rows;
}

export {
  addExpense,
  getExpenseById,
  deleteExpense,
  updateExpense,
  getAssetById,
  addAsset,
  deleteAsset,
  updateAsset,
  getExpensesForUser,
  getAssetsForUser,
  getUserInfo,
};
