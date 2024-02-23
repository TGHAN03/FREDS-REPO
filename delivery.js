// Assuming the use of the same bikeIdNames mapping
const bikeIdNames = {
    0: "PENDING",
    1: "Eduardo",
    2: "Jose",
    3: "To Go",
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
        if (id !== "0") { // Exclude "PENDING"
            const option = document.createElement('option');
            option.value = id;
            option.textContent = `${id} - ${bikeIdNames[id]}`;
            bikeIdSelect.appendChild(option);
        }
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

    const tipEntry = { bikeId, tipAmount, date: new Date().toISOString() };

    window._appDriverTips.push(tipEntry);
    saveDriverData();
    displayDriverTips();
}

function displayDriverTips() {
    const resultsDiv = document.getElementById('driverResults');
    resultsDiv.innerHTML = '';

    const totals = window._appDriverTips.reduce((acc, tip) => {
        acc[tip.bikeId] = acc[tip.bikeId] || { totalTips: 0, count: 0 };
        acc[tip.bikeId].totalTips += tip.tipAmount;
        acc[tip.bikeId].count += 1;
        return acc;
    }, {});

    Object.keys(totals).forEach(bikeId => {
        const info = totals[bikeId];
        const entry = document.createElement('div');
        entry.textContent = `${bikeIdNames[bikeId]}: $${info.totalTips.toFixed(2)} from ${info.count} deliveries`;
        resultsDiv.appendChild(entry);
    });
}

function saveDriverData() {
    localStorage.setItem('_appDriverTips', JSON.stringify(window._appDriverTips));
}