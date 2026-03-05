function showModal(iconClass, message) {
  const modal = document.getElementById('modal');
  const icon = document.getElementById('modalIcon');
  const msg = document.getElementById('modalMessage');
  icon.className = iconClass;
  msg.innerHTML = message;
  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

document.getElementById('loginForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const houseNumber = document.getElementById('houseNumber').value.trim();
  if (houseNumber) {
    showModal('fas fa-check-circle text-green-500', `Logged in as ${houseNumber}`);
    setTimeout(() => window.location.href = 'dashboard.html', 1500);
  } else {
    showModal('fas fa-exclamation-triangle text-red-500', 'Please enter house number');
  }
});

document.getElementById('resetForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const houseNumber = document.getElementById('houseNumber').value.trim();
  if (houseNumber) {
    showModal('fas fa-envelope text-blue-500', `Reset link sent for ${houseNumber}`);
    setTimeout(() => window.location.href = 'index.html', 2000);
  } else {
    showModal('fas fa-exclamation-triangle text-red-500', 'Enter house number');
  }
});