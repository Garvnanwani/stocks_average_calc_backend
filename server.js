const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors')
const dotenv = require('dotenv');
const routes = require('./routes');
const connectDB = require('./db');
const app = express()

const PORT = process.env.PORT || 5000;

dotenv.config();
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
connectDB()

app.use(routes)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
