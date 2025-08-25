/**
 * Database client for Intelligent_Automation framework
 * Supports multiple database types with connection pooling
 * (Temporarily modified to run login tests without DB dependencies)
 */
// Database dependencies temporarily commented out
// const mysql = require('mysql2/promise');
// const { Pool } = require('pg');
// const sqlite3 = require('sqlite3');
// const { open } = require('sqlite');
// const mssql = require('mssql');

class DbClient {
  constructor(type) {
    this.type = type.toLowerCase();
    this.connection = null;
    this.pool = null;
    this.results = null;
    this.queryTime = 0;
  }

  /**
   * Creates a connection pool
   * @param {Object} config - Database connection config
   */
  async createPool(config) {
    try {
      switch (this.type) {
        case 'mysql':
          this.pool = mysql.createPool({
            host: config.host,
            user: config.username,
            password: config.password,
            database: config.database,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
          });
          break;
        case 'postgres':
          this.pool = new Pool({
            user: config.username,
            host: config.host,
            database: config.database,
            password: config.password,
            port: config.port || 5432,
            max: 10
          });
          break;
        case 'mssql':
          this.pool = await mssql.connect({
            user: config.username,
            password: config.password,
            server: config.host,
            database: config.database,
            options: {
              encrypt: true,
              trustServerCertificate: true
            },
            pool: {
              max: 10,
              min: 0
            }
          });
          break;
        case 'sqlite':
          this.connection = await open({
            filename: config.filename,
            driver: sqlite3.Database
          });
          break;
        default:
          throw new Error(`Unsupported database type: ${this.type}`);
      }
      console.log(`Connected to ${this.type} database at ${config.host || config.filename}`);
    } catch (error) {
      console.error(`Failed to connect to ${this.type} database: ${error.message}`);
      throw error;
    }
  }

  /**
   * Executes a SQL query
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} - Query results
   */
  async executeQuery(sql, params = []) {
    try {
      const startTime = Date.now();
      switch (this.type) {
        case 'mysql':
          const [rows] = await this.pool.execute(sql, params);
          this.results = rows;
          break;
        case 'postgres':
          const result = await this.pool.query(sql, params);
          this.results = result.rows;
          break;
        case 'mssql':
          const mssqlResult = await this.pool.request();
          
          // Add parameters
          if (params.length > 0) {
            params.forEach((param, index) => {
              mssqlResult.input(`param${index}`, param);
            });
          }
          
          const data = await mssqlResult.query(sql);
          this.results = data.recordset;
          break;
        case 'sqlite':
          if (params.length > 0) {
            this.results = await this.connection.all(sql, params);
          } else {
            this.results = await this.connection.all(sql);
          }
          break;
      }
      this.queryTime = Date.now() - startTime;
      return this.results;
    } catch (error) {
      console.error(`Query execution failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Executes a SQL update/insert/delete
   * @param {string} sql - SQL statement
   * @param {Array} params - Query parameters
   * @returns {Promise<Object>} - Result with affected rows
   */
  async executeUpdate(sql, params = []) {
    try {
      const startTime = Date.now();
      let result;
      
      switch (this.type) {
        case 'mysql':
          [result] = await this.pool.execute(sql, params);
          this.results = { affectedRows: result.affectedRows };
          break;
        case 'postgres':
          result = await this.pool.query(sql, params);
          this.results = { affectedRows: result.rowCount };
          break;
        case 'mssql':
          const mssqlResult = await this.pool.request();
          
          // Add parameters
          if (params.length > 0) {
            params.forEach((param, index) => {
              mssqlResult.input(`param${index}`, param);
            });
          }
          
          result = await mssqlResult.query(sql);
          this.results = { affectedRows: result.rowsAffected[0] };
          break;
        case 'sqlite':
          if (params.length > 0) {
            result = await this.connection.run(sql, params);
          } else {
            result = await this.connection.run(sql);
          }
          this.results = { affectedRows: result.changes };
          break;
      }
      this.queryTime = Date.now() - startTime;
      return this.results;
    } catch (error) {
      console.error(`Update execution failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Begins a transaction
   * @returns {Promise<void>}
   */
  async beginTransaction() {
    try {
      switch (this.type) {
        case 'mysql':
          this.connection = await this.pool.getConnection();
          await this.connection.beginTransaction();
          break;
        case 'postgres':
          this.client = await this.pool.connect();
          await this.client.query('BEGIN');
          break;
        case 'mssql':
          this.transaction = new mssql.Transaction(this.pool);
          await this.transaction.begin();
          break;
        case 'sqlite':
          await this.connection.run('BEGIN TRANSACTION');
          break;
      }
    } catch (error) {
      console.error(`Failed to begin transaction: ${error.message}`);
      throw error;
    }
  }

  /**
   * Commits a transaction
   * @returns {Promise<void>}
   */
  async commitTransaction() {
    try {
      switch (this.type) {
        case 'mysql':
          await this.connection.commit();
          this.connection.release();
          break;
        case 'postgres':
          await this.client.query('COMMIT');
          this.client.release();
          break;
        case 'mssql':
          await this.transaction.commit();
          break;
        case 'sqlite':
          await this.connection.run('COMMIT');
          break;
      }
    } catch (error) {
      console.error(`Failed to commit transaction: ${error.message}`);
      throw error;
    }
  }

  /**
   * Rolls back a transaction
   * @returns {Promise<void>}
   */
  async rollbackTransaction() {
    try {
      switch (this.type) {
        case 'mysql':
          await this.connection.rollback();
          this.connection.release();
          break;
        case 'postgres':
          await this.client.query('ROLLBACK');
          this.client.release();
          break;
        case 'mssql':
          await this.transaction.rollback();
          break;
        case 'sqlite':
          await this.connection.run('ROLLBACK');
          break;
      }
    } catch (error) {
      console.error(`Failed to rollback transaction: ${error.message}`);
      throw error;
    }
  }

  /**
   * Closes all connections
   * @returns {Promise<void>}
   */
  async close() {
    try {
      switch (this.type) {
        case 'mysql':
          await this.pool.end();
          break;
        case 'postgres':
          await this.pool.end();
          break;
        case 'mssql':
          await this.pool.close();
          break;
        case 'sqlite':
          await this.connection.close();
          break;
      }
      console.log(`Disconnected from ${this.type} database`);
    } catch (error) {
      console.error(`Failed to close database connections: ${error.message}`);
      throw error;
    }
  }

  /**
   * Gets the query execution time
   * @returns {number} - Query time in ms
   */
  getQueryTime() {
    return this.queryTime;
  }

  /**
   * Verifies if a record exists
   * @param {string} table - Table name
   * @param {Object} criteria - Where conditions as key-value pairs
   * @returns {Promise<boolean>} - Whether record exists
   */
  async recordExists(table, criteria) {
    const conditions = [];
    const values = [];
    
    Object.entries(criteria).forEach(([key, value]) => {
      conditions.push(`${key} = ?`);
      values.push(value);
    });
    
    const whereClause = conditions.join(' AND ');
    const sql = `SELECT COUNT(*) as count FROM ${table} WHERE ${whereClause}`;
    
    const results = await this.executeQuery(sql, values);
    
    // Handle different DB types returning count differently
    let count;
    if (this.type === 'postgres') {
      count = parseInt(results[0].count);
    } else if (this.type === 'mysql' || this.type === 'sqlite') {
      count = results[0].count;
    } else if (this.type === 'mssql') {
      count = results[0].count;
    }
    
    return count > 0;
  }
}

module.exports = DbClient;
