document.addEventListener('DOMContentLoaded', () => {
    const monthSelect = document.getElementById('monthSelect');
    const searchBox = document.getElementById('searchBox');
    const transactionsTableBody = document.querySelector('#transactionsTable tbody');
    const statisticsDiv = document.getElementById('statistics');
    const chartDiv = document.getElementById('chart');
    let currentPage = 1;

 
    function loadMonths() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        monthSelect.innerHTML = months.map(month => `<option value="${month}">${month}</option>`).join('');
        monthSelect.value = 'Mar'; 
        fetchTransactions();
    }

    async function fetchTransactions(page = currentPage, searchQuery = '') {
        try {
            const response = await fetch(`/api/transactions?month=${monthSelect.value}&page=${page}&search=${searchQuery}`);
            const data = await response.json();
            updateTable(data.transactions);
            updateStatistics(data.statistics);
            updateChart(await fetchChartData());
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    }

    
    function updateTable(transactions) {
        transactionsTableBody.innerHTML = transactions.map(transaction => `
            <tr>
                <td>${transaction.title}</td>
                <td>${transaction.description}</td>
                <td>${transaction.price}</td>
            </tr>
        `).join('');
    }

   
    function updateStatistics(statistics) {
        statisticsDiv.innerHTML = `
            <p>Total Amount of Sale: ${statistics.totalSale}</p>
            <p>Total Sold Items: ${statistics.totalSoldItems}</p>
            <p>Total Not Sold Items: ${statistics.totalNotSoldItems}</p>
        `;
    }

    
    async function fetchChartData() {
        try {
            const response = await fetch(`/api/transactions/chart?month=${monthSelect.value}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching chart data:', error);
        }
    }

    function updateChart(chartData) {
        if (chartData) {
            const ctx = document.createElement('canvas');
            chartDiv.innerHTML = '';
            chartDiv.appendChild(ctx);
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: 'Price Range',
                        data: chartData.data,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        x: { beginAtZero: true },
                        y: { beginAtZero: true }
                    }
                }
            });
        }
    }

   
    monthSelect.addEventListener('change', () => fetchTransactions(currentPage));
    searchBox.addEventListener('input', () => fetchTransactions(currentPage, searchBox.value));
    document.getElementById('nextButton').addEventListener('click', () => {
        currentPage++;
        fetchTransactions();
    });
    document.getElementById('prevButton').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchTransactions();
        }
    });

    
    loadMonths();
});
