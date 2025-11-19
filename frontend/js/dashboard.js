// Professional Color Palettes
const COLORS = {
    primary: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'],
    gradient: [
        'rgba(102, 126, 234, 0.8)',
        'rgba(118, 75, 162, 0.8)',
        'rgba(240, 147, 251, 0.8)',
        'rgba(79, 172, 254, 0.8)',
        'rgba(67, 233, 123, 0.8)',
        'rgba(250, 112, 154, 0.8)',
        'rgba(254, 225, 64, 0.8)',
        'rgba(48, 207, 208, 0.8)'
    ],
    success: '#51cf66',
    warning: '#ff6b6b',
    info: '#339af0'
};

const CHART_OPTIONS = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            labels: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                font: { size: 12, family: 'Inter' }
            }
        }
    }
};

/* ---------------------------------------------------------
   LOAD DASHBOARD DATA FROM BACKEND
--------------------------------------------------------- */
async function loadDashboard() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const res = await fetch(`${API}/expenses/dashboard/${user.id}`);
    const data = await res.json();

    // Update UI values
    document.getElementById("today-total").textContent = `₹${parseFloat(data.today).toFixed(2)}`;
    document.getElementById("month-total").textContent = `₹${parseFloat(data.month).toFixed(2)}`;
    document.getElementById("year-total").textContent = `₹${parseFloat(data.yearTotal).toFixed(2)}`;
    document.getElementById("avg-daily").textContent = `₹${parseFloat(data.avgDaily).toFixed(2)}`;
    document.getElementById("expense-count").textContent = data.expenseCount;
    document.getElementById("top-category").textContent = data.topCategory;

    // Update charts
    updateCategoryChart(data);
    updateTrendChart(data.trend);
    updateWeeklyChart(data.weekly);
    updateCategoryBarChart(data.categoryBar);
    updateWeekdayChart(data.weekdayPattern);
    updateCategoryGrowthChart(data.categoryGrowth);
    updateVelocityChart(data.spendingVelocity);
    displayTopExpenses(data.topExpenses);
    displaySmartInsights(data);
}

/* ---------------------------------------------------------
   CATEGORY DOUGHNUT CHART (Updated with better colors)
--------------------------------------------------------- */
let categoryChart;

function updateCategoryChart(data) {
    const ctx = document.getElementById("categoryChart");

    const labels = data.categories.map(c => c.category);
    const values = data.categories.map(c => c.total);

    if (categoryChart) categoryChart.destroy();

    categoryChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: COLORS.gradient,
                borderWidth: 2,
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary'),
                hoverOffset: 8
            }]
        },
        options: {
            ...CHART_OPTIONS,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 11, family: 'Inter', weight: '500' },
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                    }
                }
            }
        }
    });
}


/* ---------------------------------------------------------
   MONTHLY TREND CHART (Enhanced with gradients)
--------------------------------------------------------- */
let trendChart;
function updateTrendChart(trend) {
    const ctx = document.getElementById("trendChart");

    const labels = trend.map(item => item.month);
    const values = trend.map(item => item.total);

    if (trendChart) trendChart.destroy();

    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(102, 126, 234, 0.4)');
    gradient.addColorStop(1, 'rgba(102, 126, 234, 0.0)');

    trendChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Monthly Spend",
                data: values,
                borderColor: '#667eea',
                backgroundColor: gradient,
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 5,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 7
            }]
        },
        options: {
            ...CHART_OPTIONS,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                    }
                }
            }
        }
    });
}
/* ---------------------------------------------------------
   WEEKLY CHART (Last 7 Days)
--------------------------------------------------------- */
let weeklyChart;

function updateWeeklyChart(weekly) {
    const ctx = document.getElementById("weeklyChart");

    const labels = weekly.map(d => d.day);
    const values = weekly.map(d => d.total);

    if (weeklyChart) weeklyChart.destroy();

    weeklyChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: COLORS.gradient.slice(0, 7),
                borderRadius: 8,
                borderWidth: 0
            }]
        },
        options: {
            ...CHART_OPTIONS,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') }
                }
            }
        }
    });
}
/* ---------------------------------------------------------
   CATEGORY BAR CHART (Horizontal)
--------------------------------------------------------- */
let categoryBarChart;

function updateCategoryBarChart(data) {
    const ctx = document.getElementById("categoryBarChart");

    const labels = data.map(item => item.category);
    const values = data.map(item => item.total);

    if (categoryBarChart) categoryBarChart.destroy();

    categoryBarChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Total Spent",
                data: values,
                backgroundColor: COLORS.gradient,
                borderRadius: 6,
                borderWidth: 0
            }]
        },
        options: {
            indexAxis: 'y',
            ...CHART_OPTIONS,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') }
                }
            }
        }
    });
}

/* ---------------------------------------------------------
   YEAR OVER YEAR TREND CHART
--------------------------------------------------------- */
let yearTrendChart;
function updateYearTrendChart(monthComparison) {
    const ctx = document.getElementById("yearTrendChart");
    
    if (!monthComparison || monthComparison.length === 0) {
        return;
    }

    const labels = monthComparison.map(item => item.month);
    const values = monthComparison.map(item => parseFloat(item.total));

    if (yearTrendChart) yearTrendChart.destroy();

    yearTrendChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Monthly Spending",
                data: values,
                backgroundColor: ["#6d5dfc", "#55efc4"],
                borderWidth: 0
            }]
        },
        options: {
            plugins: {
                legend: { display: false }
            }
        }
    });
}

/* ---------------------------------------------------------
   WEEKDAY SPENDING PATTERN CHART
--------------------------------------------------------- */
let weekdayChart;
function updateWeekdayChart(weekdayPattern) {
    const ctx = document.getElementById("weekdayChart");
    
    if (!weekdayPattern || weekdayPattern.length === 0) return;

    const labels = weekdayPattern.map(d => d.day_name.trim());
    const values = weekdayPattern.map(d => parseFloat(d.avg_amount));

    if (weekdayChart) weekdayChart.destroy();

    weekdayChart = new Chart(ctx, {
        type: "radar",
        data: {
            labels: labels,
            datasets: [{
                label: "Avg Spending",
                data: values,
                backgroundColor: 'rgba(118, 75, 162, 0.2)',
                borderColor: '#764ba2',
                borderWidth: 2,
                pointBackgroundColor: '#764ba2',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            ...CHART_OPTIONS,
            scales: {
                r: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.1)' },
                    ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') }
                }
            }
        }
    });
}

/* ---------------------------------------------------------
   CATEGORY GROWTH RATE CHART
--------------------------------------------------------- */
let categoryGrowthChart;
function updateCategoryGrowthChart(categoryGrowth) {
    const ctx = document.getElementById("categoryGrowthChart");
    
    if (!categoryGrowth || categoryGrowth.length === 0) return;

    const labels = categoryGrowth.map(c => c.category);
    const values = categoryGrowth.map(c => parseFloat(c.growth_rate));
    
    // Color based on growth (green for decrease, red for increase)
    const colors = values.map(v => v > 0 ? 'rgba(255, 107, 107, 0.7)' : 'rgba(81, 207, 102, 0.7)');

    if (categoryGrowthChart) categoryGrowthChart.destroy();

    categoryGrowthChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Growth %",
                data: values,
                backgroundColor: colors,
                borderRadius: 6
            }]
        },
        options: {
            ...CHART_OPTIONS,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: {
                        callback: function(value) { return value + '%'; },
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') }
                }
            }
        }
    });
}

/* ---------------------------------------------------------
   SPENDING VELOCITY CHART
--------------------------------------------------------- */
let velocityChart;
function updateVelocityChart(spendingVelocity) {
    const ctx = document.getElementById("velocityChart");
    
    if (!spendingVelocity || spendingVelocity.length === 0) return;

    const labels = spendingVelocity.map((v, i) => `Week ${i + 1}`);
    const expensesPerDay = spendingVelocity.map(v => parseFloat(v.expenses_per_day));
    const amountPerDay = spendingVelocity.map(v => parseFloat(v.amount_per_day));

    if (velocityChart) velocityChart.destroy();

    velocityChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels.reverse(),
            datasets: [
                {
                    label: "₹/Day",
                    data: amountPerDay.reverse(),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: "Transactions/Day",
                    data: expensesPerDay.reverse(),
                    borderColor: '#f093fb',
                    backgroundColor: 'rgba(240, 147, 251, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            ...CHART_OPTIONS,
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    beginAtZero: true,
                    grid: { display: false },
                    ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') }
                }
            }
        }
    });
}

/* ---------------------------------------------------------
   DISPLAY TOP EXPENSES LIST
--------------------------------------------------------- */
function displayTopExpenses(topExpenses) {
    const container = document.getElementById("top-expenses-list");
    
    if (!topExpenses || topExpenses.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: var(--text-secondary);">No expenses yet</p>';
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
    
    topExpenses.forEach((exp, index) => {
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-primary); border-radius: 8px;">
                <div>
                    <div style="font-weight: 600; color: var(--text-primary);">₹${parseFloat(exp.amount).toFixed(2)}</div>
                    <div style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">${exp.category} - ${exp.date}</div>
                    ${exp.note ? `<div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${exp.note}</div>` : ''}
                </div>
                <div style="font-size: 24px; font-weight: 700; color: var(--accent-color);">#${index + 1}</div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

/* ---------------------------------------------------------
   SMART INSIGHTS GENERATOR
--------------------------------------------------------- */
// function displaySmartInsights(data) {
//     const container = document.getElementById("smart-insights");
//     const insights = [];

//     // Budget Recommendation Insight
//     if (data.budgetRecommendation && data.budgetRecommendation.recommended_budget) {
//         const recommendedBudget = parseFloat(data.budgetRecommendation.recommended_budget);
//         const currentMonth = parseFloat(data.month);
//         const percentUsed = (currentMonth / recommendedBudget * 100).toFixed(1);
        
//         let budgetClass = 'success';
//         let budgetIcon = '✅';
//         if (percentUsed > 90) {
//             budgetClass = 'warning';
//             budgetIcon = '⚠️';
//         } else if (percentUsed > 100) {
//             budgetClass = 'warning';
//             budgetIcon = '🚨';
//         }
        
//         insights.push({
//             type: budgetClass,
//             icon: budgetIcon,
//             label: 'Budget Status',
//             text: `You've used ${percentUsed}% of recommended monthly budget (₹${recommendedBudget.toFixed(2)})`
//         });
//     }

//     // Spending Trend Insight
//     if (data.monthComparison && data.monthComparison.length >= 2) {
//         const current = parseFloat(data.monthComparison[0].total);
//         const previous = parseFloat(data.monthComparison[1].total);
//         const change = ((current - previous) / previous * 100).toFixed(1);
        
//         const trendClass = change > 0 ? 'warning' : 'success';
//         const trendIcon = change > 0 ? '📈' : '📉';
//         const trendText = change > 0 ? 'increased' : 'decreased';
        
//         insights.push({
//             type: trendClass,
//             icon: trendIcon,
//             label: 'Monthly Trend',
//             text: `Spending ${trendText} by ${Math.abs(change)}% vs last month`
//         });
//     }

//     // Top Category Insight
//     if (data.topCategory && data.topCategory !== 'None') {
//         insights.push({
//             type: 'info',
//             icon: '🎯',
//             label: 'Top Category',
//             text: `${data.topCategory} is your highest spending category this month`
//         });
//     }

//     // Category Growth Alert
//     if (data.categoryGrowth && data.categoryGrowth.length > 0) {
//         const fastestGrowth = data.categoryGrowth[0];
//         if (parseFloat(fastestGrowth.growth_rate) > 50) {
//             insights.push({
//                 type: 'warning',
//                 icon: '🔥',
//                 label: 'Growth Alert',
//                 text: `${fastestGrowth.category} spending up ${fastestGrowth.growth_rate}% from last month`
//             });
//         }
//     }

//     // Average Daily Insight
//     if (data.avgDaily) {
//         const avgDaily = parseFloat(data.avgDaily);
//         insights.push({
//             type: 'info',
//             icon: '📅',
//             label: 'Daily Average',
//             text: `Your average daily spending is ₹${avgDaily.toFixed(2)} (last 30 days)`
//         });
//     }

//     // Spending Velocity Insight
//     if (data.spendingVelocity && data.spendingVelocity.length >= 2) {
//         const latest = parseFloat(data.spendingVelocity[0].amount_per_day);
//         const previous = parseFloat(data.spendingVelocity[1].amount_per_day);
//         const velocityChange = ((latest - previous) / previous * 100).toFixed(1);
        
//         if (Math.abs(velocityChange) > 20) {
//             insights.push({
//                 type: velocityChange > 0 ? 'warning' : 'success',
//                 icon: '⏱️',
//                 label: 'Velocity Change',
//                 text: `Daily spending rate ${velocityChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(velocityChange)}% this week`
//             });
//         }
//     }

//     // Render insights
//     let html = '';
//     if (insights.length === 0) {
//         html = '<p style="text-align:center; color: var(--text-secondary); padding: 20px;">Add more expenses to get smart insights!</p>';
//     } else {
//         insights.forEach(insight => {
//             html += `
//                 <div class="insight-item ${insight.type}">
//                     <div class="insight-label">${insight.icon} ${insight.label}</div>
//                     <div class="insight-value">${insight.text}</div>
//                 </div>
//             `;
//         });
//     }
    
//     container.innerHTML = html;
// }

/* ---------------------------------------------------------
   CALL FUNCTION ON PAGE LOAD
--------------------------------------------------------- */
window.onload = loadDashboard;
