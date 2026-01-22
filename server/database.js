import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DB_PATH || join(__dirname, 'database.sqlite');

// Criar conexão com verbose para debug
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('✅ Conectado ao banco de dados SQLite em:', dbPath);
  }
});

// Inicializar banco de dados com tabela de usuários
export function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Criar tabela de usuários
      db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          senha_hash TEXT NOT NULL,
          nome TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabela:', err.message);
          reject(err);
        } else {
          console.log('✅ Tabela "usuarios" criada/verificada com sucesso');
          resolve();
        }
      });
    });
  });
}

// Criar usuário
export function createUser(email, senhaHash, nome = null) {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO usuarios (email, senha_hash, nome) VALUES (?, ?, ?)';
    db.run(query, [email, senhaHash, nome], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, email, nome });
      }
    });
  });
}

// Buscar usuário por email
export function findUserByEmail(email) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM usuarios WHERE email = ?';
    db.get(query, [email], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Buscar usuário por ID
export function findUserById(id) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT id, email, nome, created_at FROM usuarios WHERE id = ?';
    db.get(query, [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Listar todos os usuários (sem senha)
export function getAllUsers() {
  return new Promise((resolve, reject) => {
    const query = 'SELECT id, email, nome, created_at FROM usuarios';
    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export default db;
