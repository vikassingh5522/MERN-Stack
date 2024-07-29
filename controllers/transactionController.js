const Transaction = require('../models/Transaction');

exports.listTransactions = (req, res) => {
    const { search = '', page = 1, perPage = 10 } = req.query;
    
    
    const query = {
        $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { price: { $regex: search, $options: 'i' } }
        ]
    };

  
    Transaction.find(query)
        .skip((page - 1) * perPage)
        .limit(Number(perPage))
        .then(transactions => {
            res.status(200).json(transactions);
        })
        .catch(error => {
            res.status(500).json({ error: 'Failed to retrieve transactions: ' + error.message });
        });
};
