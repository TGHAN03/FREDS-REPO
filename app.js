// Ensure global storage for orders and tips totals for each Bike ID is correctly initialized
window._appOrders = window._appOrders || [];
window._appTotalTipsByBikeId = window._appTotalTipsByBikeId || {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
window.editingIndex = null; // Index of the order being edited, null if adding a new order

document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent the form from submitting traditionally

    // Retrieve input values
    const orderNumber = document.getElementById('orderNumber').value;
    const tipAmount = parseFloat(document.getElementById('tipAmount').value);
    const bikeId = parseInt(document.getElementById('bikeId').value, 10);

    const order = { orderNumber, tipAmount, bikeId };

    if (window.editingIndex !== null) {
        // Update existing order
        window._appOrders[window.editingIndex] = order;
    } else {
        // Add new order
        window._appOrders.push(order);
    }

    // Reset editing index and form for next input
    window.editingIndex = null;
    document.getElementById('orderForm').reset();

    // Update UI
    displayOrders();
    updateTotalTipsByBikeId();
});

// Function to display orders
function displayOrders() {
    const ordersContainer = document.getElementById('orderList');
    ordersContainer.innerHTML = ''; // Clear current list

    // Create the header row
    const headerRow = document.createElement('div');
    headerRow.className = 'transaction-header';
    headerRow.innerHTML = `
        <div class="header-item">Order #</div>
        <div class="header-item">Tip Amount</div>
        <div class="header-item">Bike ID</div>
        <div class="header-item">Edit</div>
    `;
    ordersContainer.appendChild(headerRow);

    // Iterate over orders to create rows with an edit icon
    window._appOrders.forEach((order, index) => {
        const orderRow = document.createElement('div');
        orderRow.className = 'transaction-row';
        orderRow.innerHTML = `
            <div class="row-item">${order.orderNumber}</div>
            <div class="row-item">$${order.tipAmount.toFixed(2)}</div>
            <div class="row-item">${order.bikeId}</div>
            <div class="row-item"><button onclick="editOrder(${index})">✏️</button></div>
        `;
        ordersContainer.appendChild(orderRow);
    });
}

// Function to handle order editing
function editOrder(index) {
    window.editingIndex = index;
    const order = window._appOrders[index];
    document.getElementById('orderNumber').value = order.orderNumber;
    document.getElementById('tipAmount').value = order.tipAmount;
    document.getElementById('bikeId').value = order.bikeId;

    // Scroll to form for user convenience
    document.getElementById('orderForm').scrollIntoView();
}

// Function to recalculate and display total tips by Bike ID
function updateTotalTipsByBikeId() {
    // Reset totals
    window._appTotalTipsByBikeId = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};

    // Recalculate totals from the orders list
    window._appOrders.forEach(order => {
        if (window._appTotalTipsByBikeId.hasOwnProperty(order.bikeId)) {
            window._appTotalTipsByBikeId[order.bikeId] += order.tipAmount;
        } else {
            // In case there are bike IDs outside the initial range
            window._appTotalTipsByBikeId[order.bikeId] = order.tipAmount;
        }
    });

    // Display the recalculated totals
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h2>Results</h2>'; // Clear current content
    Object.keys(window._appTotalTipsByBikeId).forEach(bikeId => {
        const p = document.createElement('p');
        p.textContent = `Bike ID ${bikeId}: $${window._appTotalTipsByBikeId[bikeId].toFixed(2)}`;
        resultsDiv.appendChild(p);
    });
}


// Function to handle order editing
function editOrder(index) {
    window.editingIndex = index;
    const order = window._appOrders[index];
    document.getElementById('orderNumber').value = order.orderNumber;
    document.getElementById('tipAmount').value = order.tipAmount;
    document.getElementById('bikeId').value = order.bikeId;

    // Add 'edit-mode' class to input elements
    document.getElementById('orderNumber').classList.add('edit-mode');
    document.getElementById('tipAmount').classList.add('edit-mode');
    document.getElementById('bikeId').classList.add('edit-mode');

    // Scroll to form for user convenience
    document.getElementById('orderForm').scrollIntoView();
}

// Reset form and clear 'edit-mode' class from input elements
function resetFormAndClearEditMode() {
    document.getElementById('orderForm').reset();
    document.getElementById('orderNumber').classList.remove('edit-mode');
    document.getElementById('tipAmount').classList.remove('edit-mode');
    document.getElementById('bikeId').classList.remove('edit-mode');
}

// Modify the form submission handler to call resetFormAndClearEditMode
document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent the form from submitting traditionally

    // Retrieve input values and the rest of the submission logic...

    // Reset editing index, form for next input, and remove edit mode indication
    window.editingIndex = null;
    resetFormAndClearEditMode();

    // Update UI
    displayOrders();
    updateTotalTipsByBikeId();
});
