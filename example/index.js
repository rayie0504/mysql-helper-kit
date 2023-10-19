const express = require('express');
const app = express();
const { initConnection, read, update, create, execute, startTransaction, commitTransaction, getSingleConnection, releaseSingleConnection, rollbackTransaction } = require('mysql-helper-kit');

// Configure the MySQL connection
const mysqlConfig = {
  host: 'your-mysql-host',
  database: 'your-database-name',
  user: 'your-username',
  password: 'your-password'
};
initConnection(mysqlConfig);

app.get('/read', async (req, res) => {
  try {
    const results = await read('your-table-name', 'column1, column2', { condition1: 'value1' });
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to read data from the database' });
  }
});

app.put('/update', async (req, res) => {
  try {
    const updatedRows = await update('your-table-name', { column1: 'new-value' }, { condition1: 'value1' });
    res.json(updatedRows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update data in the database' });
  }
});

app.post('/create', async (req, res) => {
  const newData = {
    column1: 'new-value',
  };
  try {
    const newRecord = await create('your-table-name', newData);
    res.json(newRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to insert data into the database' });
  }
});

app.get('/execute', async (req, res) => {
  const customQuery = 'SELECT * FROM your-table-name WHERE column1 = ?';
  const queryParams = ['value1'];
  try {
    const customResults = await execute(customQuery, queryParams);
    res.json(customResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to execute the custom query' });
  }
});

app.get('/transaction', async (req, res) => {
  let con = await getSingleConnection();
  const newData = {
    column1: 'new-value',
  };
  try {
    await startTransaction(con);
    const newRecord = await create('your-table-name', newData, con);
    const newRecord2 = await create('your-table-name', newData, con);
    await commitTransaction(con);
    res.json(newRecord2);
  } catch (error) {
    await rollbackTransaction(con);
    res.status(500).json({ error: 'Failed to execute the query' });
  } finally {
    await releaseSingleConnection(con);
  }
})

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



