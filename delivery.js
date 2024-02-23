// Mapping Bike IDs to names, excluding "0" as "PENDING"
const bikeIdNames = {
    1: "Eduardo",
    2: "Jose",
    4: "Honorio",
    5: "Gilberto"
};

// Load stored data or initialize if not present for drivers
window._appDriverTips = JSON.parse(localStorage.getItem('_appDriverTips')) || [];

document.addEventListener('DOMContentLoaded', function() {
    displayDriverTips();
    document.getElementById('tipForm').addEventListener('submit', handleTipSubmit);

    // Populate bikeId select options
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
    document.getElementById('errorMessage').textContent = '';

    if (isNaN(tipAmount) || tipAmount <= 0) {
        document.getElementById('errorMessage').textContent = "Please enter a valid tip amount.";
        return;
    }

    const tipEntry = { 
        bikeId, 
        tipAmount
    };

    window._appDriverTips.push(tipEntry);
    saveDriverData();
    displayDriverTips();
}

function displayDriverTips() {
    const tipsContainer = document.getElementById('driverTips');
    tipsContainer.innerHTML = '';
    let totalTips = 0;

    window._appDriverTips.forEach((tip) => {
        const bikeName = bikeIdNames[tip.bikeId];
        const tipRow = document.createElement('div');
        tipRow.className = 'tip-row';
        tipRow.innerHTML = `Driver: ${bikeName}, Tip: $${tip.tipAmount.toFixed(2)}`;
        tipsContainer.appendChild(tipRow);
        totalTips += tip.tipAmount;
    });

    // Display total tips
    const totalTipsElement = document.getElementById('totalTips');
    totalTipsElement.textContent = `Total Tips: $${totalTips.toFixed(2)}`;
}

function saveDriverData() {
    localStorage.setItem('_appDriverTips', JSON.stringify(window._appDriverTips));
}