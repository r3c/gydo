import mariadb from "mariadb";

let connectionPool: mariadb.Pool | undefined = undefined;

function getOrCreatePool() {
  if (connectionPool !== undefined) {
    return connectionPool;
  }

  const connectionString = process.env.DATABASE_URL;

  if (connectionString === undefined) {
    throw new Error("connection string undefined");
  }

  const newConnectionPool = mariadb.createPool(
    connectionString.replace("mysql://", "mariadb://")
  );

  connectionPool = newConnectionPool;

  return newConnectionPool;
}

export async function mariadbQuery(query: string, values?: any) {
  const connectionPool = getOrCreatePool();
  const connection = await connectionPool.getConnection();

  try {
    const rows = await connection.query(query, values);

    return rows;
  } finally {
    connection.release();
  }
}
