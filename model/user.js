const mysql = require("mysql2/promise");

const userSchema = {
  id: { type: Number, required: false },
  username: { type: String, required: true },
  password: { type: String, required: true },
};

module.exports = {
    userSchema,
    async getUserByUsername(username) {
        const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
}
