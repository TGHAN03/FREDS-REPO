// Mapping Bike IDs to names
const bikeIdNames = {
    1: "Eduardo",
    2: "Jose",
    3: "To Go",
    4: "Honorio",
    5: "Gilberto"
};

// Ensure global storage for orders and tips totals for each Bike ID is correctly initialized
window._appOrders = window._appOrders || [];
window._appTotalTipsByBikeId = window._appTotalTipsByBikeId || {1: 0, 2: 0, 4: 0, 5: 0, 3: 0};
window.editingIndex = null; // Index of the order being edited, null if adding a new order

document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent the form from submitting traditionally

    const orderNumber = document.getElementById('orderNumber').value;
    const tipAmount = parseFloat(document.getElementById('tipAmount').value);
    const bikeId = parseInt(document.getElementById('bikeId').value, 10);

    // Clear any previous error messages
    document.getElementById('errorMessage').textContent = '';

    // Validate bikeId
    if (![1, 2, 3, 4, 5].includes(bikeId)) {
        document.getElementById('errorMessage').textContent = "Invalid Bike ID. Please enter a Bike ID between 1 and 5.";
        return; // Stop execution if bikeId is not valid
    }

    const order = { orderNumber, tipAmount, bikeId };

    if (window.editingIndex !== null) {
        window._appOrders[window.editingIndex] = order;
    } else {
        window._appOrders.push(order);
    }

    window.editingIndex = null;
    resetFormAndClearEditMode(); // Now resets form and clears edit mode

    displayOrders();
    updateTotalTipsByBikeId();
});

function displayOrders() {
    const ordersContainer = document.getElementById('orderList');
    ordersContainer.innerHTML = '';

    const headerRow = document.createElement('div');
    headerRow.className = 'transaction-header';
    headerRow.innerHTML = `
        <div class="header-item">Order #</div>
        <div class="header-item">Tip</div>
        <div class="header-item">ID</div>
        <div class="header-item">Actions</div>
    `;
    ordersContainer.appendChild(headerRow);

    window._appOrders.forEach((order, index) => {
        const bikeName = bikeIdNames[order.bikeId];
        const orderRow = document.createElement('div');
        orderRow.className = 'transaction-row';
        orderRow.innerHTML = `
            <div class="row-item">${order.orderNumber}</div>
            <div class="row-item">$${order.tipAmount.toFixed(2)}</div>
            <div class="row-item">${order.bikeId} (${bikeName})</div>
            <div class="row-item">
                <button onclick="editOrder(${index})">✏️</button>
                <button onclick="deleteOrder(${index})">❌</button>
            </div>
        `;
        ordersContainer.appendChild(orderRow);
    });
}

// Function to handle deletion of an order
function deleteOrder(index) {
    const isConfirmed = confirm("Are you sure you want to delete this order?");
    if (isConfirmed) {
        window._appOrders.splice(index, 1); // Remove the order from the array
        displayOrders(); // Refresh the list of orders
        updateTotalTipsByBikeId(); // Update totals after deletion
    }
}

function editOrder(index) {
    window.editingIndex = index;
    const order = window._appOrders[index];
    document.getElementById('orderNumber').value = order.orderNumber;
    document.getElementById('tipAmount').value = order.tipAmount;
    document.getElementById('bikeId').value = order.bikeId;

    document.getElementById('orderNumber').classList.add('edit-mode');
    document.getElementById('tipAmount').classList.add('edit-mode');
    document.getElementById('bikeId').classList.add('edit-mode');

    document.getElementById('orderForm').scrollIntoView();
}

function updateTotalTipsByBikeId() {
    document.getElementById('results').style.display = 'table'; // Show the results section

    window._appTotalTipsByBikeId = {1: 0, 2: 0, 4: 0, 5: 0, 3: 0};

    window._appOrders.forEach(order => {
        if (window._appTotalTipsByBikeId.hasOwnProperty(order.bikeId)) {
            window._appTotalTipsByBikeId[order.bikeId] += order.tipAmount;
        }
    });

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<div class="transaction-header2"><div class="header-item2">Bike ID</div><div class="header-item2">Name</div><div class="header-item2">Total Tips</div></div>';

    [1, 2, 4, 5, 3].forEach(bikeId => {
        const bikeName = bikeIdNames[bikeId];
        const totalRow = document.createElement('div');
        totalRow.className = 'transaction-row2';
        totalRow.innerHTML = `
            <div class="row-item2">${bikeId}</div>
            <div class="row-item2">${bikeName}</div>
            <div class="row-item2">$${window._appTotalTipsByBikeId[bikeId].toFixed(2)}</div>
        `;
        resultsDiv.appendChild(totalRow);
    });
}

function resetFormAndClearEditMode() {
    document.getElementById('orderForm').reset();
    document.getElementById('orderNumber').classList.remove('edit-mode');
    document.getElementById('tipAmount').classList.remove('edit-mode');
    document.getElementById('bikeId').classList.remove('edit-mode');

    // Set focus to the first input box after resetting the form
    document.getElementById('orderNumber').focus();
}

document.getElementById('exportCsv').addEventListener('click', function(e) {
    e.preventDefault(); // Prevent the default form submission
    const isConfirmed = confirm("Are you sure you want to download the CSV?");
    if (isConfirmed) {
        exportOrdersToCsv();
    }
});

function exportOrdersToCsv() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Order Number,Tip Amount,Bike ID,Bike Name\n";

    window._appOrders.forEach(function(order) {
        const bikeName = bikeIdNames[order.bikeId];
        let row = `${order.orderNumber},${order.tipAmount},${order.bikeId},"${bikeName}"`;
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    if (window._appOrders.length > 0) {
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "orders_log.csv");
        document.body.appendChild(link); // Necessary for Firefox
        link.click();
        document.body.removeChild(link); // Clean up after download
    } else {
        alert("No orders to export.");
    }
}
document.addEventListener('DOMContentLoaded', function() {
    const toggleDarkModeButton = document.getElementById('toggleDarkMode');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentMode = localStorage.getItem('darkMode');

    if (currentMode === 'enabled' || (currentMode === null && prefersDarkScheme)) {
        document.body.classList.add('dark-mode');
    }

    toggleDarkModeButton.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        let mode = document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled';
        localStorage.setItem('darkMode', mode);
    });
});