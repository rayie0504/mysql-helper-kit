import mysql from 'mysql';
import util from 'util';

let creds: any = {
    host: "", 
    port: 3306,
    database: "", 
    password: "",
    name: "",
    user: "",
    connector: "mysql",
    connectTimeout: 100000,
    acquireTimeout: 50000,
    connectionLimit: 50,
};

interface MysqlInputs {
  host: string;
  port?: number;
  database: string;
  password?: string;
  name?: string;
  user?: string;
  connectTimeout?: number;
  acquireTimeout?: number;
  connectionLimit?: number;
}

const createConfiguration = (mysqlCreds: MysqlInputs) => {
    creds = { ...mysqlCreds };
    return poolConnection(creds);
};

let con: any;
let defaultCon: any;
// node native promisify
const initConnection = (mysqlCreds: MysqlInputs) => {
    defaultCon = poolConnection(mysqlCreds);
};

const poolConnection = (mysqlCreds: any) => {
    con = mysql.createPool(mysqlCreds);
    con.getConnection((error: any, connection: any) => {
        if (error) {
            throw error;
        }
        if (connection) connection.release();
    });
    return con;
};

const getSingleConnection = async (connection: any = con) => {
    return new Promise((resolve, reject) => {
        connection.getConnection((error: Error, sconnection: any) => {
            if (error) reject(error);
            resolve(sconnection);
        });
    });
};

// function for fetching the details
const read = async (
    table: string,
    columns = "*",
    whereData: any = {},
    orderBy:any = false,
    connection: any = defaultCon
) => {
    connection.query = util.promisify(connection.query);
    try {
        let query = `
        SELECT
            ${columns ? columns : `*`}
        FROM
            ${table} `;
        let whereCondition = " WHERE  1=1";
        if (Object.keys(whereData).length) {
            const keys = Object.keys(whereData);
            keys.map((v) => {
                whereCondition += ` And ${v} = '${whereData[v]}'`;
            });
        }
        query += whereCondition;
        if (orderBy) {
            query += ` ORDER BY ${orderBy}`;
        }

        return await connection.query(query);
    } catch (error) {
        throw error;
    }
};

// function for updating the table
const update = async (
    table: string,
    data = {},
    whereData: any = {},
    connection: any = defaultCon,
    queryFlag:boolean = false
) => {
    connection.query = util.promisify(connection.query);
    if (Object.keys(whereData).length === 0 || whereData.constructor !== Object) {
        throw new Error("Required where clause for updating the table");
    }

    try {
        let whereCondition = "";
        const keys = Object.keys(whereData);
        keys.map((v, k) => {
            whereCondition += ` ${k === 0 ? "" : " And"} ${v} = '${whereData[v]}'`;
        });

        const query = `
        UPDATE
            ${table}
        SET
            ? 
        WHERE
            ${whereCondition}
    `;

        const result = await connection.query(query, [data]);
        if (queryFlag) {
            const sqlQuery = mysql.format(query, [data]);
            return {
                result,
                query: sqlQuery
            };
        }
        return result;
    } catch (error) {
        throw error;
    }
};

// function for inserting records
const create = async (
    table: string,
    data = {},
    connection: any = defaultCon,
    queryFlag: boolean = false
) => {
    connection.query = util.promisify(connection.query);
    try {
        const query = `INSERT INTO ${table} SET ?`;
        const result = await connection.query(query, [data]);
        if (queryFlag) {
            const sqlQuery = mysql.format(query, [data]);
            return {
                ...result,
                query: sqlQuery
            };
        }
        return result;
    } catch (error) {
        throw error;
    }
};

// for executing any query
const execute = async (
    query: string,
    data: any = "",
    connection: any = defaultCon
) => {
    connection.query = util.promisify(connection.query);
    try {
        const result = await connection.query(query, data);
        return result;
    } catch (error) {
        throw error;
    }
};

const startTransaction = async (connection: any) => {
    try {
        return await connection.beginTransaction();
    } catch (error) {
        throw error;
    }
};

const rollbackTransaction = async (connection: any) => {
    try {
        return await connection.rollback();
    } catch (error) {
        throw error;
    }
};

const commitTransaction = async (connection: any) => {
    try {
        return await connection.commit();
    } catch (error) {
        throw error;
    }
};

const releaseSingleConnection = async (connection: any) => {
    try {
        return await connection.release();
    } catch (error) {
        throw error;
    }
};

export {
    createConfiguration,
    read,
    update,
    create,
    execute,
    startTransaction,
    rollbackTransaction,
    commitTransaction,
    getSingleConnection,
    releaseSingleConnection,
    initConnection,
};