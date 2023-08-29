const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;
const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

mongoose.connect(mongoURI, mongoOptions)
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

module.exports = mongoose;
