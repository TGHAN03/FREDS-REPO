// Mapping Bike IDs to names, including "0" as "PENDING"
const bikeIdNames = {
    0: "PENDING",
    1: "Eduardo",
    2: "Jose",
    3: "To Go",
    4: "Arunlfo",
    5: "Busser"
};

// Load stored data or initialize if not present
window._appOrders = JSON.parse(localStorage.getItem('_appOrders')) || [];
window._appTotalTipsByBikeId = JSON.parse(localStorage.getItem('_appTotalTipsByBikeId')) || {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
window.editingIndex = null;

document.addEventListener('DOMContentLoaded', function() {
    displayOrders();
    updateTotalTipsByBikeId();
    document.getElementById('orderForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('exportCsv').addEventListener('click', exportOrdersToCsv);

    const toggleDarkModeButton = document.getElementById('toggleDarkMode');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentMode = localStorage.getItem('darkMode');
    if (currentMode === 'enabled' || (currentMode === null && prefersDarkScheme)) {
        document.body.classList.add('dark-mode');
    }
    toggleDarkModeButton.addEventListener('click', toggleDarkMode);

    // Initialize live total tips
    initLiveTotalTips();
});

// ---------------- Live Total Tips ----------------
function initLiveTotalTips() {
    const tipInput = document.getElementById('tipAmount');
    tipInput.addEventListener('input', () => {
        let currentTip = parseFloat(tipInput.value) || 0;
        let total = window._appOrders.reduce((sum, order) => sum + order.tipAmount, 0);
        total += currentTip; // include the tip currently being typed
        document.getElementById('totalTips').textContent = total.toFixed(2);
    });
}
// -------------------------------------------------

function handleFormSubmit(e) {
    e.preventDefault();

    const orderNumber = document.getElementById('orderNumber').value;
    const tipAmount = parseFloat(document.getElementById('tipAmount').value);
    const bikeId = parseInt(document.getElementById('bikeId').value, 10);
    document.getElementById('errorMessage').textContent = '';

    if (![0, 1, 2, 3, 4, 5].includes(bikeId)) {
        document.getElementById('errorMessage').textContent = "Invalid Bike ID. Please enter a Bike ID between 0 and 5.";
        return;
    }

    const order = {
        orderNumber, 
        tipAmount, 
        bikeId
    };

    if (window.editingIndex !== null) {
        window._appOrders[window.editingIndex] = order;
    } else {
        window._appOrders.push(order);
    }

    window.editingIndex = null;
    resetFormAndClearEditMode();
    displayOrders();
    updateTotalTipsByBikeId();
    saveData();
}

function displayOrders() {
    const ordersContainer = document.getElementById('orderList');
    ordersContainer.innerHTML = '<div class="transaction-header"><div class="header-item">Ticket #</div><div class="header-item">Order #</div><div class="header-item">Tip</div><div class="header-item">ID (Name)</div><div class="header-item">Actions</div></div>';

    window._appOrders.forEach((order, index) => {
        const bikeName = bikeIdNames[order.bikeId];
        const orderRow = document.createElement('div');
        orderRow.className = 'transaction-row';
        orderRow.innerHTML = `<div class="row-item">${index + 1}</div><div class="row-item">${order.orderNumber}</div><div class="row-item">$${order.tipAmount.toFixed(2)}</div><div class="row-item">${order.bikeId} (${bikeName})</div><div class="row-item"><button onclick="editOrder(${index})">✏️</button><button onclick="deleteOrder(${index})">❌</button></div>`;
        ordersContainer.appendChild(orderRow);
    });
}

function deleteOrder(index) {
    if (confirm("Are you sure you want to delete this order?")) {
        window._appOrders.splice(index, 1);
        displayOrders();
        updateTotalTipsByBikeId();
        saveData();
        // Update live total as well
        document.getElementById('tipAmount').dispatchEvent(new Event('input'));
    }
}

function editOrder(index) {
    const order = window._appOrders[index];
    document.getElementById('orderNumber').value = order.orderNumber;
    document.getElementById('tipAmount').value = order.tipAmount;
    document.getElementById('bikeId').value = order.bikeId;
    window.editingIndex = index;
    document.getElementById('orderForm').scrollIntoView();
}

function updateTotalTipsByBikeId() {
    document.getElementById('results').style.display = 'table';
    window._appTotalTipsByBikeId = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0};

    window._appOrders.forEach(order => {
        if (order.bikeId in window._appTotalTipsByBikeId) {
            window._appTotalTipsByBikeId[order.bikeId] += order.tipAmount;
        }
    });

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<div class="transaction-header2"><div class="header-item2">Bike ID</div><div class="header-item2">Name</div><div class="header-item2">Total Tips</div></div>';
    Object.keys(bikeIdNames).forEach(bikeId => {
        const bikeName = bikeIdNames[bikeId];
        const totalRow = document.createElement('div');
        totalRow.className = 'transaction-row2';
        totalRow.innerHTML = `<div class="row-item2">${bikeId}</div><div class="row-item2">${bikeName}</div><div class="row-item2">$${window._appTotalTipsByBikeId[bikeId].toFixed(2)}</div>`;
        resultsDiv.appendChild(totalRow);
    });

    // Update the grand total span
    const grandTotal = window._appOrders.reduce((sum, order) => sum + order.tipAmount, 0);
    document.getElementById('totalTips').textContent = grandTotal.toFixed(2);
}

function resetFormAndClearEditMode() {
    document.getElementById('orderForm').reset();
    window.editingIndex = null;
    document.getElementById('orderNumber').focus();
    // Update live total when cleared
    document.getElementById('tipAmount').dispatchEvent(new Event('input'));
}

function exportOrdersToCsv() {
    if (!confirm("Are you sure you want to download the CSV?")) return;
    let csvContent = "data:text/csv;charset=utf-8,Ticket Number,Order Number,Tip Amount,Bike ID,Bike Name\n";
    window._appOrders.forEach((order, index) => {
        const bikeName = bikeIdNames[order.bikeId];
        let row = `${index + 1},${order.orderNumber},${order.tipAmount},${order.bikeId},"${bikeName}"`;
        csvContent += row + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    if (window._appOrders.length > 0) {
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "orders_log.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert("No orders to export.");
    }
}

function saveData() {
    localStorage.setItem('_appOrders', JSON.stringify(window._appOrders));
    localStorage.setItem('_appTotalTipsByBikeId', JSON.stringify(window._appTotalTipsByBikeId));
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    let mode = document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled';
    localStorage.setItem('darkMode', mode);
}
