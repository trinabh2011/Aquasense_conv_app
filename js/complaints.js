// Show modal function (if not in main.js)
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

// Submit complaint form
document.getElementById('complaintForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const reason = document.getElementById('reason').value;
  const description = document.getElementById('description').value;
  
  // Show success modal
  showModal('fas fa-check-circle text-green-500', `✅ Complaint submitted: "${reason}"`);
  
  // Clear form
  document.getElementById('description').value = '';
});

// Auto complaint
setTimeout(() => {
  const list = document.getElementById('autoComplaints');
  const item = document.createElement('li');
  item.className = "complaint-item";
  item.innerHTML = `<i class="fas fa-bolt text-red-500 mr-1"></i> Auto: Sudden TDS spike at ${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
  list.appendChild(item);
}, 3000);