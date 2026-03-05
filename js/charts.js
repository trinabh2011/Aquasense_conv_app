document.addEventListener("DOMContentLoaded", function () {
  const dates = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
  const tdsData = [320, 310, 480, 520, 490, 330, 315];
  const waterData = [20, 45, 60, 95, 130, 155, 188];

  // TDS Chart
  new Chart(document.getElementById('tdsChart'), {
    type: 'line',
     {
      labels: dates,
      datasets: [{
        label: 'TDS (ppm)',
         tdsData,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true
      }]
    },
    options: { 
      responsive: true, 
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  // Water Chart
  new Chart(document.getElementById('waterChart'), {
    type: 'bar',
     {
      labels: dates,
      datasets: [{
        label: 'Water Used (L)',
         waterData,
        backgroundColor: '#3B82F6'
      }]
    },
    options: { 
      responsive: true, 
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  document.getElementById('exportBtn')?.addEventListener('click', () => {
    showModal('fas fa-file-export text-green-500', 'Data exported as CSV successfully!');
  });
});

// Show modal function (if not in main.js)
function showModal(iconClass, message) {
  const modal = document.getElementById('modal');
  const icon = document.getElementById('modalIcon');
  const msg = document.getElementById('modalMessage');
  icon.className = iconClass;
  msg.innerHTML = message;
  modal.classList.remove('hidden');
}