const Transaction = require('../models/Transaction');

const getDateRange = (month) => {
    const startDate = new Date(`2022-${month}-01`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    return { startDate, endDate };
};

exports.getStatistics = async (req, res) => {
    const { month } = req.query;
    const { startDate, endDate } = getDateRange(month);

    try {
        const [totalSaleAmount, totalSoldItems, totalNotSoldItems] = await Promise.all([
            Transaction.aggregate([
                { $match: { dateOfSale: { $gte: startDate, $lt: endDate }, sold: true } },
                { $group: { _id: null, total: { $sum: '$price' } } }
            ]).then(result => result[0] ? result[0].total : 0),
            Transaction.countDocuments({ dateOfSale: { $gte: startDate, $lt: endDate }, sold: true }),
            Transaction.countDocuments({ dateOfSale: { $gte: startDate, $lt: endDate }, sold: false })
        ]);

        res.status(200).json({ totalSaleAmount, totalSoldItems, totalNotSoldItems });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getBarChart = async (req, res) => {
    const { month } = req.query;
    const { startDate, endDate } = getDateRange(month);

    const priceRanges = [
        { range: '0-100', min: 0, max: 100 },
        { range: '101-200', min: 101, max: 200 },
        { range: '201-300', min: 201, max: 300 },
        { range: '301-400', min: 301, max: 400 },
        { range: '401-500', min: 401, max: 500 },
        { range: '501-600', min: 501, max: 600 },
        { range: '601-700', min: 601, max: 700 },
        { range: '701-800', min: 701, max: 800 },
        { range: '801-900', min: 801, max: 900 },
        { range: '901-above', min: 901, max: Infinity }
    ];

    try {
        const barChartData = await Promise.all(priceRanges.map(range =>
            Transaction.countDocuments({
                dateOfSale: { $gte: startDate, $lt: endDate },
                price: { $gte: range.min, $lt: range.max }
            }).then(count => ({ range: range.range, count }))
        ));

        res.status(200).json(barChartData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPieChart = async (req, res) => {
    const { month } = req.query;
    const { startDate, endDate } = getDateRange(month);

    try {
        const pieChartData = await Transaction.aggregate([
            { $match: { dateOfSale: { $gte: startDate, $lt: endDate } } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $project: { category: '$_id', count: 1, _id: 0 } }
        ]);

        res.status(200).json(pieChartData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCombinedData = async (req, res) => {
    try {
        const { month } = req.query;
        const [statistics, barChart, pieChart] = await Promise.all([
            exports.getStatistics(req, res),
            exports.getBarChart(req, res),
            exports.getPieChart(req, res)
        ]);

        res.status(200).json({ statistics, barChart, pieChart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
