let tds = 320;
let flow = 2.4;
let total = 188;
let bluetoothConnected = false;
let bluetoothDevice = null;
// 🔥 Firebase Setup
let currentUser = "H101"; // change dynamically later if needed

// 🔥 Utility functions for Firebase data fetching
async function fetchAllSensorData() {
  try {
    const response = await fetch(`https://aquasense-cloud-1-default-rtdb.asia-southeast1.firebasedatabase.app/sensorHistory/${currentUser}.json`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch sensor data:", error);
    return null;
  }
}

async function fetchBluetoothReadings() {
  const data = await fetchAllSensorData();
  if (!data) return [];
  
  return Object.entries(data || {})
    .filter(([id, reading]) => reading.source === 'bluetooth')
    .map(([id, reading]) => ({ id, ...reading }))
    .sort((a, b) => b.timestamp - a.timestamp);
}

async function fetchConnectedReadings() {
  const data = await fetchAllSensorData();
  if (!data) return [];
  
  return Object.entries(data || {})
    .filter(([id, reading]) => reading.bluetoothConnected === true)
    .map(([id, reading]) => ({ id, ...reading }))
    .sort((a, b) => b.timestamp - a.timestamp);
}

async function storeToDatabase(tds, flow, total, source = 'manual') {
  try {
    const payload = {
      tds: tds,
      flow: flow,
      total: total,
      timestamp: Date.now(),
      source: source,
      bluetoothConnected: bluetoothConnected
    };
    
    await fetch(`https://aquasense-cloud-1-default-rtdb.asia-southeast1.firebasedatabase.app/sensorHistory/${currentUser}.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    console.log(`Stored ${source} data:`, payload);
  } catch (error) {
    console.error("Failed to store data:", error);
  }
}

function updateReadings() {
  // Only update TDS if Bluetooth is not connected
  if (!bluetoothConnected) {
    tds = Math.floor(300 + Math.random() * 300);
  }
  flow = parseFloat((2.0 + Math.random() * 1.5).toFixed(1));
  total = parseFloat((total + Math.random() * 0.5).toFixed(2));

  document.getElementById('tdsValue').textContent = tds;
  document.getElementById('flowRate').textContent = `${flow} L/min`;
  document.getElementById('totalWater').textContent = `${Math.round(total)} L`; // Unit Added

  const statusCard = document.getElementById('tdsStatusCard');
  const statusText = statusCard.querySelector('h3');
  const descText = statusCard.querySelector('p');

  if (tds > 500) {
    statusCard.className = 'p-4 border rounded-lg bg-red-50 border-red-200 text-center';
    statusText.textContent = 'Water Quality: Unsafe';
    statusText.className = 'text-md font-semibold text-red-800';
    descText.textContent = 'Avoid consumption until checked';
    descText.className = 'text-sm text-red-600';
    document.getElementById('alertBanner').classList.remove('hidden');
    showModal('fas fa-bolt text-red-500', 'High TDS detected! Auto-complaint filed.');
  } else {
    statusCard.className = 'p-4 border rounded-lg bg-green-50 border-green-200 text-center';
    statusText.textContent = 'Water Quality: Safe';
    statusText.className = 'text-md font-semibold text-green-800';
    descText.textContent = 'Ideal for drinking';
    descText.className = 'text-sm text-green-600';
    document.getElementById('alertBanner').classList.add('hidden');
  }

  document.getElementById('lastTDS').textContent = `${tds} ppm`;
  document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}

// Bluetooth connection function
async function connectBluetooth() {
  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb']
    });

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(
      '0000ffe0-0000-1000-8000-00805f9b34fb'
    );

    const characteristic = await service.getCharacteristic(
      '0000ffe1-0000-1000-8000-00805f9b34fb'
    );

    await characteristic.startNotifications();

    characteristic.addEventListener(
      'characteristicvaluechanged',
      event => {
        const value = new TextDecoder().decode(event.target.value);
        console.log('Raw Bluetooth data:', value);
        console.log('Buffer data:', event.target.value);
        
        // Try different parsing methods
        let tdsValue = null;
        
        // Method 1: Parse as text
        const textValue = parseInt(value.trim());
        if (!isNaN(textValue)) {
          tdsValue = textValue;
          console.log('Parsed as text:', tdsValue);
        }
        
        // Method 2: Parse as bytes if text fails
        if (tdsValue === null && event.target.value.byteLength > 0) {
          const bytes = new Uint8Array(event.target.value.buffer);
          tdsValue = bytes[0]; // Take first byte
          console.log('Parsed as byte:', tdsValue);
        }
        
        if (tdsValue !== null && !isNaN(tdsValue)) {
          tds = tdsValue;
          updateTDSDisplay();
          storeToDatabase(tds, flow, total, 'bluetooth'); // 🔥 Store with Bluetooth source
          console.log('Updated TDS to:', tds);
        } else {
          console.log('Failed to parse TDS value from:', value);
        }
      }
    );

    bluetoothDevice = device;
    bluetoothConnected = true;
    document.getElementById('bluetoothStatus').textContent = 'Connected';
    document.getElementById('bluetoothStatus').className = 'text-green-500';
    document.getElementById('connectBluetoothBtn').innerHTML = '<i class="fas fa-bluetooth-b text-xl"></i><span class="font-medium">Disconnect</span><i class="fas fa-bluetooth text-purple-100"></i>';
    showModal('fas fa-bluetooth text-purple-500', 'Bluetooth connected successfully!');

  } catch (error) {
    console.error('Bluetooth connection failed:', error);
    showModal('fas fa-exclamation-triangle text-red-500', 'Bluetooth connection failed!');
  }
}

// Disconnect Bluetooth
function disconnectBluetooth() {
  if (bluetoothDevice && bluetoothDevice.gatt.connected) {
    bluetoothDevice.gatt.disconnect();
  }
  bluetoothConnected = false;
  bluetoothDevice = null;
  document.getElementById('bluetoothStatus').textContent = 'Disconnected';
  document.getElementById('bluetoothStatus').className = 'text-red-500';
  document.getElementById('connectBluetoothBtn').innerHTML = '<i class="fas fa-bluetooth-b text-xl"></i><span class="font-medium">Connect Bluetooth</span><i class="fas fa-bluetooth text-purple-100"></i>';
  showModal('fas fa-bluetooth-slash text-gray-500', 'Bluetooth disconnected');
}

// Update TDS display and status
function updateTDSDisplay() {
  document.getElementById('tdsValue').textContent = tds;
  document.getElementById('lastTDS').textContent = `${tds} ppm`;
  document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
// 🔥 Store simulated values too (only when not using Bluetooth)
if (!bluetoothConnected) {
  storeToDatabase(tds, flow, total, 'manual');
}
  const statusCard = document.getElementById('tdsStatusCard');
  const statusText = statusCard.querySelector('h3');
  const descText = statusCard.querySelector('p');

  if (tds > 500) {
    statusCard.className = 'p-4 border rounded-lg bg-red-50 border-red-200 text-center';
    statusText.textContent = 'Water Quality: Unsafe';
    statusText.className = 'text-md font-semibold text-red-800';
    descText.textContent = 'Avoid consumption until checked';
    descText.className = 'text-sm text-red-600';
    document.getElementById('alertBanner').classList.remove('hidden');
    if (bluetoothConnected) {
      showModal('fas fa-bolt text-red-500', 'High TDS detected! Auto-complaint filed.');
    }
  } else {
    statusCard.className = 'p-4 border rounded-lg bg-green-50 border-green-200 text-center';
    statusText.textContent = 'Water Quality: Safe';
    statusText.className = 'text-md font-semibold text-green-800';
    descText.textContent = 'Ideal for drinking';
    descText.className = 'text-sm text-green-600';
    document.getElementById('alertBanner').classList.add('hidden');
  }
}

document.getElementById('measureTankBtn')?.addEventListener('click', () => {
  const simulatedTDS = Math.floor(200 + Math.random() * 400);
  tds = simulatedTDS; // Update current TDS value
  updateTDSDisplay();
  storeToDatabase(tds, flow, total, 'manual'); // Store as manual measurement
  showModal('fas fa-vial text-blue-500', `Tank TDS: ${simulatedTDS} ppm<br><small>Measurement complete</small>`);
});

// Bluetooth button event listener
document.getElementById('connectBluetoothBtn')?.addEventListener('click', () => {
  if (bluetoothConnected) {
    disconnectBluetooth();
  } else {
    connectBluetooth();
  }
});

// 🔥 Test function to demonstrate data fetching (call from console)
async function testFirebaseData() {
  console.log('=== Testing Firebase Data Fetch ===');
  
  // Fetch all data
  const allData = await fetchAllSensorData();
  console.log('All sensor data:', allData);
  
  // Fetch only Bluetooth readings
  const bluetoothReadings = await fetchBluetoothReadings();
  console.log('Bluetooth readings only:', bluetoothReadings);
  
  // Fetch connected readings
  const connectedReadings = await fetchConnectedReadings();
  console.log('Connected readings only:', connectedReadings);
  
  return { allData, bluetoothReadings, connectedReadings };
}

// Make test function available globally
window.testFirebaseData = testFirebaseData;

updateReadings();
setInterval(updateReadings, 5000);
