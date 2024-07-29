// Database Configuration


const mongoose = require('mongoose');

const connectDB = () => {
    mongoose.connect('mongodb://localhost:27017/roxiler', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('MongoDB Connected'))
    .catch((error) => {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    });
};

module.exports = connectDB;


