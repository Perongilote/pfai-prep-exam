let chartInstance = null;

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
const formatNumber = (val) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(val);
const formatPercent = (val) => (val * 100).toFixed(2) + '%';

function getValues() {
    return {
        periods: parseInt(document.getElementById('periods').value) || 12,
        launching: parseFloat(document.getElementById('launching').value),
        revPerConv: parseFloat(document.getElementById('revPerConv').value),
        growth: parseFloat(document.getElementById('growth').value),
        response: parseFloat(document.getElementById('response').value),
        churn: parseFloat(document.getElementById('churn').value),
        variableCost: parseFloat(document.getElementById('variable').value),
        fixedCost: parseFloat(document.getElementById('fixed').value),
        startingCost: parseFloat(document.getElementById('starting').value),
    };
}

function updateSimulation() {
    const v = getValues();
    let labels = [];
    let customersData = [];
    let profitData = [];
    
    let currentCustomers = v.launching;
    let totalRevenue = 0;
    let totalExpenses = v.startingCost;
    
    for (let i = 1; i <= v.periods; i++) {
        labels.push(i);
        
        // Simplified growth / churn calculation
        currentCustomers = currentCustomers * (1 + v.growth - v.churn);
        customersData.push(currentCustomers);
        
        let activeResponders = currentCustomers * v.response;
        let periodRev = activeResponders * v.revPerConv;
        let periodExp = v.fixedCost + (activeResponders * v.variableCost);
        
        totalRevenue += periodRev;
        totalExpenses += periodExp;
        
        profitData.push(totalRevenue - totalExpenses);
    }
    
    // Update Chart
    drawChart(labels, profitData, customersData);
    
    // Update Summary
    document.getElementById('sum-period').innerText = v.periods;
    document.getElementById('sum-customers').innerText = formatNumber(customersData[customersData.length - 1]);
    document.getElementById('sum-revenue').innerText = formatCurrency(totalRevenue);
    document.getElementById('sum-expenses').innerText = formatCurrency(totalExpenses);
    
    let totalProfit = totalRevenue - totalExpenses;
    document.getElementById('sum-profit').innerText = formatCurrency(totalProfit);
    
    let roi = totalExpenses > 0 ? (totalProfit / totalExpenses) : 0;
    document.getElementById('sum-roi').innerText = formatPercent(roi);
}

function drawChart(labels, profitData, customersData) {
    const ctx = document.getElementById('metricsChart').getContext('2d');
    
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Profit',
                    type: 'line',
                    data: profitData,
                    borderColor: '#5D9C4A',
                    backgroundColor: 'white',
                    borderWidth: 3,
                    pointBackgroundColor: 'white',
                    pointBorderColor: '#5D9C4A',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    yAxisID: 'y-profit',
                    tension: 0.1
                },
                {
                    label: 'Customers',
                    type: 'bar',
                    data: customersData,
                    backgroundColor: '#2C5DA7',
                    yAxisID: 'y-customers'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false } // Custom legend built in HTML
            },
            scales: {
                x: {
                    grid: { display: false }
                },
                'y-customers': {
                    type: 'linear',
                    position: 'left',
                    grid: { color: '#f0f0f0' }
                },
                'y-profit': {
                    type: 'linear',
                    position: 'right',
                    display: false, // Hiding right axis to match design cleanliness
                    grid: { display: false }
                }
            }
        }
    });
}

function syncInputs() {
    const sliders = ['launching', 'revPerConv', 'growth', 'response', 'churn', 'variable', 'fixed', 'starting'];
    sliders.forEach(id => {
        const slider = document.getElementById(id);
        const textVal = document.getElementById('val-' + id);
        
        slider.addEventListener('input', (e) => {
            textVal.value = e.target.value;
            updateSimulation();
        });
    });
    
    document.getElementById('periods').addEventListener('change', updateSimulation);
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    syncInputs();
    updateSimulation();
});