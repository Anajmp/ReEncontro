// =====================================================================
// Pool de conexões MySQL (mysql2)
// IMPORTANTE: use sempre db.execute() com placeholders (?) nas queries.
// Nunca concatene strings — isso previne SQL injection.
// =====================================================================
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

export async function testConnection() {
  try {
    const conn = await db.getConnection();
    console.log('Conectado ao MySQL');
    conn.release();
  } catch (err) {
    console.error('Erro ao conectar no MySQL:', err.message);
    process.exit(1);
  }
}
