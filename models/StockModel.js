const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stockSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    transactionId: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    tradeType: {
        type: String,
        required: true
    },
    average: {
        type: Number,
        required: false
    }
});

module.exports = mongoose.model('Stock', stockSchema);
