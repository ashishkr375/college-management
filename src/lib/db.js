import mysql from 'mysql2/promise';

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 3,
      maxIdle: 2,
      idleTimeout: 30000,
      queueLimit: 10,
      acquireTimeout: 10000,
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected pool error:', err);
    });
  }
  return pool;
}

async function getConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await getPool().getConnection();
      return connection;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

export async function executeQuery(query, values = []) {
  let connection;
  try {
    const pool = getPool();
    connection = await pool.getConnection();
    const [results] = await connection.query(query, values);
    return results;
  } catch (error) {
    console.error('Database Error:', error);
    // Return a more specific error message
    throw error;
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (error) {
        console.error('Error releasing connection:', error);
      }
    }
  }
}

export async function endPool() {
  if (pool) {
    try {
      await pool.end();
    } catch (error) {
      console.error('Error ending pool:', error);
    }
  }
}

export async function getPoolStatus() {
  if (!pool) return null;
  return {
    threadId: pool.threadId,
    activeConnections: pool._allConnections.length,
    idleConnections: pool._freeConnections.length,
    waitingRequests: pool._connectionQueue.length
  };
}

export { getPool as pool };