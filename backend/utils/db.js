const { Pool } = require('pg');

class Sql {
  constructor() { this.pool = null; }

  async connect() {
    if (this.pool) { return this.pool; }

    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      max: 20,                            // maximum connections in the pool
      idleTimeoutMillis: 30_000,          // close inactive connections after 30s
      connectionTimeoutMillis: 2_000,     // timeout if no connection available
    });

    try {
      const client = await this.pool.connect();
      console.log('INFO : Database connection opened');
      client.release();
    } catch (err) {
      console.error('INFO : Failed to connect to db:', err.message);
      throw err;
    }

    return this.pool;
  }

  async disconnect() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('INFO : Database connection closed');
    }
  }

  /*
    e.g. :
      select('user', { id: 1 }, 'name, email')
      query output : SELECT name, email FROM users WHERE id = $1
      values : [1]
  */
  async select(table, where = {}, columns = '*') {
    let query = `SELECT ${columns} FROM ${table}`;
    const values = [];
    const conditions = [];

    Object.keys(where).forEach((key, index) => {
      conditions.push(`${key} = $${index + 1}`);
      values.push(where[key]);
    });

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    const result = await this.pool.query(query, values);
    return result.rows;
  }

  /*
    e.g. :
      insert('users', { name: 'John', email: 'john@example.com' })
      query : INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *
      values : ['John', 'john@example.com']
  */
  async insert(table, data) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`);

    const query = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }


  /*
    e.g.
      update('users', { name: 'Jane' }, { id: 1 })
      query output : UPDATE users SET name = $1 WHERE id = $2 RETURNING *
      values : ['Jane', 1]
  */
  async update(table, data, where = {}) {
    const setColumns = Object.keys(data);
    const setValues = Object.values(data);
    const whereColumns = Object.keys(where);
    const whereValues = Object.values(where);

    const setClause = setColumns.map((col, index) => `${col} = $${index + 1}`).join(', ');
    const whereClause = whereColumns.map((col, index) => `${col} = $${setColumns.length + index + 1}`).join(' AND ');

    let query = `UPDATE ${table} SET ${setClause}`;
    if (whereClause) {
      query += ` WHERE ${whereClause}`;
    }
    query += ` RETURNING *`;

    const result = await this.pool.query(query, [...setValues, ...whereValues]);
    return result.rows[0];
  }

  /*
    e.g.
      delete('users', { id: 1 })
      query output : DELETE FROM users WHERE id = $1
      values : [1]
  */
  async delete(table, where = {}) {
    const columns = Object.keys(where);
    const values = Object.values(where);
    const conditions = columns.map((col, index) => `${col} = $${index + 1}`);

    let query = `DELETE FROM ${table}`;
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    await this.pool.query(query, values);
  }

  /*
    e.g.
      query('SELECT * FROM users WHERE id = $1', [1])
      for custom queries like JOINs
  */
  async query(sql, values = []) {
    return await this.pool.query(sql, values);
  }

}

const db = new Sql();
module.exports = db;
