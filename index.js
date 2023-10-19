"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initConnection = exports.releaseSingleConnection = exports.getSingleConnection = exports.commitTransaction = exports.rollbackTransaction = exports.startTransaction = exports.execute = exports.create = exports.update = exports.read = void 0;
const mysql_1 = __importDefault(require("mysql"));
const util_1 = __importDefault(require("util"));
let creds = {
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
let con;
let defaultCon;
// node native promisify
const initConnection = (mysqlCreds) => {
    defaultCon = poolConnection(mysqlCreds);
};
exports.initConnection = initConnection;
const poolConnection = (mysqlCreds) => {
    con = mysql_1.default.createPool(mysqlCreds);
    con.getConnection((error, connection) => {
        if (error) {
            throw error;
        }
        if (connection)
            connection.release();
    });
    return con;
};
const getSingleConnection = (connection = con) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        connection.getConnection((error, sconnection) => {
            if (error)
                reject(error);
            resolve(sconnection);
        });
    });
});
exports.getSingleConnection = getSingleConnection;
// function for fetching the details
const read = (table, columns = "*", whereData = {}, orderBy = false, connection = defaultCon) => __awaiter(void 0, void 0, void 0, function* () {
    connection.query = util_1.default.promisify(connection.query);
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
        return yield connection.query(query);
    }
    catch (error) {
        throw error;
    }
});
exports.read = read;
// function for updating the table
const update = (table, data = {}, whereData = {}, connection = defaultCon) => __awaiter(void 0, void 0, void 0, function* () {
    connection.query = util_1.default.promisify(connection.query);
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
        const result = yield connection.query(query, [data]);
        return result;
    }
    catch (error) {
        throw error;
    }
});
exports.update = update;
// function for inserting records
const create = (table, data = {}, connection = defaultCon) => __awaiter(void 0, void 0, void 0, function* () {
    connection.query = util_1.default.promisify(connection.query);
    try {
        const query = `INSERT INTO ${table} SET ?`;
        const result = yield connection.query(query, [data]);
        return result;
    }
    catch (error) {
        throw error;
    }
});
exports.create = create;
// for executing any query
const execute = (query, data = "", connection = defaultCon) => __awaiter(void 0, void 0, void 0, function* () {
    connection.query = util_1.default.promisify(connection.query);
    try {
        const result = yield connection.query(query, data);
        return result;
    }
    catch (error) {
        throw error;
    }
});
exports.execute = execute;
const startTransaction = (connection) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield connection.beginTransaction();
    }
    catch (error) {
        throw error;
    }
});
exports.startTransaction = startTransaction;
const rollbackTransaction = (connection) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield connection.rollback();
    }
    catch (error) {
        throw error;
    }
});
exports.rollbackTransaction = rollbackTransaction;
const commitTransaction = (connection) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield connection.commit();
    }
    catch (error) {
        throw error;
    }
});
exports.commitTransaction = commitTransaction;
const releaseSingleConnection = (connection) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield connection.release();
    }
    catch (error) {
        throw error;
    }
});
exports.releaseSingleConnection = releaseSingleConnection;
