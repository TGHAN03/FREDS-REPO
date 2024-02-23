const bikeIdNames = {
    1: "Eduardo",
    2: "Jose",
    4: "Honorio",
    5: "Gilberto"
};

window._appDriverTips = JSON.parse(localStorage.getItem('_appDriverTips')) || [];
window.editingIndex = null; // Track the index of the entry being edited

document.addEventListener('DOMContentLoaded', function() {
    displayDriverTips();
    document.getElementById('tipForm').addEventListener('submit', handleTipSubmit);
    document.getElementById('cancelEdit').addEventListener('click', cancelEdit); // Button to cancel edit mode

    const bikeIdSelect = document.getElementById('bikeId');
    Object.keys(bikeIdNames).forEach(id => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = `${id} - ${bikeIdNames[id]}`;
        bikeIdSelect.appendChild(option);
    });
});

function handleTipSubmit(e) {
    e.preventDefault();

    const bikeId = parseInt(document.getElementById('bikeId').value, 10);
    const tipAmount = parseFloat(document.getElementById('tipAmount').value);
    const orderNumber = document.getElementById('orderNumber').value; // Assume orderNumber input is added
    document.getElementById('errorMessage').textContent = '';

    if (isNaN(tipAmount) || tipAmount <= 0) {
        document.getElementById('errorMessage').textContent = "Please enter a valid tip amount.";
        return;
    }

    const tipEntry = { bikeId, tipAmount, orderNumber };

    if (window.editingIndex !== null) {
        window._appDriverTips[window.editingIndex] = tipEntry;
    } else {
        window._appDriverTips.push(tipEntry);
    }

    saveDriverData();
    displayDriverTips();
    resetFormAndClearEditMode();
}

function displayDriverTips() {
    const tipsContainer = document.getElementById('driverTips');
    tipsContainer.innerHTML = '';
    let totalTips = 0;

    window._appDriverTips.forEach((tip, index) => {
        const bikeName = bikeIdNames[tip.bikeId];
        const tipRow = document.createElement('div');
        tipRow.className = 'tip-row';
        tipRow.innerHTML = `
            <div>Driver: ${bikeName}, Tip: $${tip.tipAmount.toFixed(2)}, Order: ${tip.orderNumber || 'N/A'}</div>
            <button onclick="editTip(${index})">Edit</button>
            <button onclick="deleteTip(${index})">Delete</button>
        `;
        tipsContainer.appendChild(tipRow);
        totalTips += tip.tipAmount;
    });

    document.getElementById('totalTips').textContent = `Total Tips: $${totalTips.toFixed(2)}`;
}

function editTip(index) {
    const tip = window._appDriverTips[index];
    document.getElementById('bikeId').value = tip.bikeId;
    document.getElementById('tipAmount').value = tip.tipAmount;
    document.getElementById('orderNumber').value = tip.orderNumber || '';
    window.editingIndex = index;

    document.getElementById('cancelEdit').style.display = 'inline'; // Show cancel edit button
}

function deleteTip(index) {
    if (confirm("Are you sure you want to delete this tip?")) {
        window._appDriverTips.splice(index, 1);
        saveDriverData();
        displayDriverTips();
    }
}

function saveDriverData() {
    localStorage.setItem('_appDriverTips', JSON.stringify(window._appDriverTips));
}

function resetFormAndClearEditMode() {
    document.getElementById('tipForm').reset();
    window.editingIndex = null;
    document.getElementById('cancelEdit').style.display = 'none'; // Hide cancel edit button
}

function cancelEdit() {
    resetFormAndClearEditMode();
}