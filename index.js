require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const healthRoute = require('./routes/HealthRoute')

/**
 * APP
 */
const app = express();
app.use(express.json())


/**
 * DATABASE CONNCECTION
 */
mongoose.connect(process.env.DATABASE_URL)
mongoose.connection.once('connected', () => {console.log('Databse connected')})
mongoose.connection.on('error', (er) => {console.log('Database error', er)})

app.use('/health', healthRoute)


/**
 * SERVER LISTEM
 */
app.listen(process.env.SERVER_PORT, () => {
  console.log(`App server is running at ${process.env.SERVER_PORT}`);
});


