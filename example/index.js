const express = require('express');
const app = express();
const { createConfiguration, read, update, create, execute, startTransaction, commitTransaction } = require('mysql-helper-kit');

// Configure the MySQL connection
const mysqlConfig = {
  host: 'your-mysql-host',
  database: 'your-database-name',
  user: 'your-username',
  password: 'your-password',
};
createConfiguration(mysqlConfig);

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

  const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

  
  
