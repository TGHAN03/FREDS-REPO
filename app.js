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

    const order = { orderNumber, tipAmount, bikeId };

    if (window.editingIndex !== null) {
        window._appOrders[window.editingIndex] = order;
    } else {
        window._appOrders.push(order);
    }

    // Validate bikeId
    if (![1, 2, 3, 4, 5].includes(bikeId)) {
        alert("Invalid Bike ID. Please enter a Bike ID between 1 and 5.");
        return; // Stop execution if bikeId is not valid
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
        <div class="header-item">Tip Amount</div>
        <div class="header-item">Bike ID</div>
        <div class="header-item">Edit</div>
    `;
    ordersContainer.appendChild(headerRow);

    window._appOrders.forEach((order, index) => {
        const bikeName = bikeIdNames[order.bikeId]; // Get the bike name
        const orderRow = document.createElement('div');
        orderRow.className = 'transaction-row';
        orderRow.innerHTML = `
            <div class="row-item">${order.orderNumber}</div>
            <div class="row-item">$${order.tipAmount.toFixed(2)}</div>
            <div class="row-item">${order.bikeId} (${bikeName})</div>
            <div class="row-item"><button onclick="editOrder(${index})">✏️</button></div>
        `;
        ordersContainer.appendChild(orderRow);
    });
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
    // Make the results div visible
    document.getElementById('results').style.display = 'inline-block'; // Adjust display style as needed

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
        totalRow.className = bikeId === 3 ? 'transaction-row2 special-bike-row' : 'transaction-row2';
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
                }
                
                document.getElementById('exportCsv').addEventListener('click', function() {
                exportOrdersToCsv();
                });


                
                function exportOrdersToCsv() {
                    let csvContent = "data:text/csv;charset=utf-8,";
                    csvContent += "Order Number,Tip Amount,Bike ID,Bike Name\n"; // CSV header
                
                    window._appOrders.forEach(function(order) {
                        const bikeName = bikeIdNames[order.bikeId];
                        let row = `${order.orderNumber},${order.tipAmount},${order.bikeId},"${bikeName}"`;
                        csvContent += row + "\n";
                    });
                
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", "orders_log.csv");
                    document.body.appendChild(link); // Necessary for Firefox
                    link.click(); // Trigger the download
                }