/**
 * Lumina Smart Home OS - Energy Analytics & Charts
 * Configured for Glassmorphism UI
 */

let energyHourlyChart = null;
let energyCategoryChart = null;
let weeklyComparisonChart = null;

function initEnergyCharts() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#94a3b8' : '#09090b';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
  const primaryStroke = isDark ? '#38bdf8' : '#09090b';
  const primaryFill = isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(9, 9, 11, 0.05)';

  // 1. Hourly Consumption Line Chart
  const hourlyCtx = document.getElementById('hourlyEnergyChart');
  if (hourlyCtx) {
    if (energyHourlyChart) energyHourlyChart.destroy();

    const hours = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
    const todayUsage = [0.8, 0.5, 1.2, 2.8, 3.4, 2.9, 4.1, 3.2];
    const yesterdayUsage = [0.9, 0.6, 1.4, 2.5, 3.1, 2.7, 3.8, 3.0];

    energyHourlyChart = new Chart(hourlyCtx, {
      type: 'line',
      data: {
        labels: hours,
        datasets: [
          {
            label: 'Today (kW)',
            data: todayUsage,
            borderColor: primaryStroke,
            backgroundColor: primaryFill,
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: primaryStroke,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Yesterday (kW)',
            data: yesterdayUsage,
            borderColor: isDark ? 'rgba(156, 163, 175, 0.4)' : 'rgba(0, 0, 0, 0.22)',
            borderDash: [5, 5],
            borderWidth: 2,
            fill: false,
            tension: 0.35,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: textColor, boxWidth: 12, font: { family: 'Inter', size: 12, weight: 600 } }
          },
          tooltip: {
            backgroundColor: 'rgba(9, 9, 11, 0.9)',
            titleColor: '#fff',
            bodyColor: '#e4e4e7',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            borderWidth: 1,
            padding: 10,
            displayColors: true
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: 'Inter', size: 11, weight: 500 } }
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: 'Inter', size: 11, weight: 500 }, callback: v => v + ' kW' }
          }
        }
      }
    });
  }

  // 2. Category Distribution Doughnut Chart
  const categoryCtx = document.getElementById('categoryEnergyChart');
  if (categoryCtx) {
    if (energyCategoryChart) energyCategoryChart.destroy();

    energyCategoryChart = new Chart(categoryCtx, {
      type: 'doughnut',
      data: {
        labels: ['Climate Control', 'Smart Lighting', 'Kitchen Appliances', 'Entertainment', 'Other Devices'],
        datasets: [{
          data: [46, 18, 20, 10, 6],
          backgroundColor: isDark 
            ? ['#38bdf8', '#fbbf24', '#34d399', '#a78bfa', '#94a3b8']
            : ['#09090b', '#52525b', '#059669', '#d97706', '#a1a1aa'],
          borderWidth: 2,
          borderColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: textColor, boxWidth: 12, font: { family: 'Inter', size: 12, weight: 600 } }
          },
          tooltip: {
            backgroundColor: 'rgba(9, 9, 11, 0.9)',
            titleColor: '#fff',
            bodyColor: '#e4e4e7',
            callbacks: {
              label: function(context) {
                return ` ${context.label}: ${context.raw}% (${(context.raw * 0.22).toFixed(1)} kWh)`;
              }
            }
          }
        },
        cutout: '72%'
      }
    });
  }

  // 3. Weekly Consumption & Solar Production
  const weeklyCtx = document.getElementById('weeklyEnergyChart');
  if (weeklyCtx) {
    if (weeklyComparisonChart) weeklyComparisonChart.destroy();

    weeklyComparisonChart = new Chart(weeklyCtx, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Grid Usage (kWh)',
            data: [14.2, 12.8, 15.5, 13.9, 16.4, 18.2, 17.0],
            backgroundColor: isDark ? 'rgba(56, 189, 248, 0.75)' : '#09090b',
            borderRadius: 6
          },
          {
            label: 'Solar Generated (kWh)',
            data: [8.5, 10.2, 9.8, 11.4, 7.6, 12.1, 11.8],
            backgroundColor: isDark ? 'rgba(52, 211, 153, 0.85)' : '#059669',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: textColor, boxWidth: 12, font: { family: 'Inter', size: 12, weight: 600 } }
          },
          tooltip: {
            backgroundColor: 'rgba(9, 9, 11, 0.9)',
            titleColor: '#fff',
            bodyColor: '#e4e4e7'
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: { family: 'Inter', size: 11, weight: 500 } }
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: 'Inter', size: 11, weight: 500 } }
          }
        }
      }
    });
  }
}

window.refreshChartsTheme = function() {
  initEnergyCharts();
};
