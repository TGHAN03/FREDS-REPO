// Mapping Bike IDs to names
const bikeIdNames = {
    0: "PENDING",
    1: "Eduardo",
    2: "Jose",
    3: "To Go",
    4: "Arunlfo",
    5: "Busser"
};

// Load stored data or initialize
window._appOrders = JSON.parse(localStorage.getItem('_appOrders')) || [];
window._appTotalTipsByBikeId = JSON.parse(localStorage.getItem('_appTotalTipsByBikeId')) || {0:0,1:0,2:0,3:0,4:0,5:0};
window.editingIndex = null;

document.addEventListener('DOMContentLoaded', function() {

    // DOM elements
    const orderForm = document.getElementById('orderForm');
    const orderNumberInput = document.getElementById('orderNumber');
    const tipAmountInput = document.getElementById('tipAmount');
    const bikeIdInput = document.getElementById('bikeId');
    const errorMessageDiv = document.getElementById('errorMessage');
    const orderListDiv = document.getElementById('orderList');
    const resultsDiv = document.getElementById('results');
    const totalTipsSpan = document.getElementById('totalTips');
    const exportCsvButton = document.getElementById('exportCsv');
    const clearAllButton = document.getElementById('clearAll');
    const toggleDarkModeButton = document.getElementById('toggleDarkMode');

    // Initialize dark mode
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentMode = localStorage.getItem('darkMode');
    if (currentMode === 'enabled' || (currentMode === null && prefersDarkScheme)) {
        document.body.classList.add('dark-mode');
    }
    toggleDarkModeButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
    });

    // Display orders and totals on load
    displayOrders();
    updateTotalTips();

    // ------------------ Form Submit ------------------
    orderForm.addEventListener('submit', function(e){
        e.preventDefault();
        const orderNumber = orderNumberInput.value;
        const tipAmount = parseFloat(tipAmountInput.value);
        const bikeId = parseInt(bikeIdInput.value);

        errorMessageDiv.textContent = '';

        if(![0,1,2,3,4,5].includes(bikeId)){
            errorMessageDiv.textContent = "Invalid Bike ID. Enter 0-5.";
            return;
        }

        const order = {orderNumber, tipAmount, bikeId};

        if(window.editingIndex !== null){
            window._appOrders[window.editingIndex] = order;
        } else {
            window._appOrders.push(order);
        }

        window.editingIndex = null;
        orderForm.reset();
        orderNumberInput.focus();
        saveData();
        displayOrders();
        updateTotalTips();
    });

    // ------------------ Live total while typing ------------------
    tipAmountInput.addEventListener('input', updateTotalTips);

    bikeIdInput.addEventListener('input', updateTotalTips);

    // ------------------ Export CSV ------------------
    exportCsvButton.addEventListener('click', function(){
        if(!window._appOrders.length){ alert("No orders to export."); return; }
        let csv="data:text/csv;charset=utf-8,Ticket Number,Order Number,Tip Amount,Bike ID,Bike Name\n";
        window._appOrders.forEach((order,index)=>{
            csv += `${index+1},${order.orderNumber},${order.tipAmount},${order.bikeId},"${bikeIdNames[order.bikeId]}"\n`;
        });
        const link = document.createElement('a');
        link.href = encodeURI(csv);
        link.download = "orders_log.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // ------------------ Clear All Orders ------------------
    clearAllButton.addEventListener('click', function(){
        if(!confirm("Are you sure you want to clear all orders?")) return;
        window._appOrders = [];
        window._appTotalTipsByBikeId = {0:0,1:0,2:0,3:0,4:0,5:0};
        localStorage.removeItem('_appOrders');
        localStorage.removeItem('_appTotalTipsByBikeId');
        orderForm.reset();
        orderNumberInput.focus();
        displayOrders();
        updateTotalTips();
    });

    // ------------------ Functions ------------------
    function displayOrders(){
        orderListDiv.innerHTML='<div class="transaction-header"><div class="header-item">Ticket #</div><div class="header-item">Order #</div><div class="header-item">Tip</div><div class="header-item">ID (Name)</div><div class="header-item">Actions</div></div>';
        window._appOrders.forEach((order,index)=>{
            const row=document.createElement('div');
            row.className='transaction-row';
            row.innerHTML=`
                <div class="row-item">${index+1}</div>
                <div class="row-item">${order.orderNumber}</div>
                <div class="row-item">$${order.tipAmount.toFixed(2)}</div>
                <div class="row-item">${order.bikeId} (${bikeIdNames[order.bikeId]})</div>
                <div class="row-item">
                    <button onclick="editOrder(${index})">✏️</button>
                    <button onclick="deleteOrder(${index})">❌</button>
                </div>`;
            orderListDiv.appendChild(row);
        });
    }

    window.editOrder = function(index){
        const order = window._appOrders[index];
        orderNumberInput.value = order.orderNumber;
        tipAmountInput.value = order.tipAmount;
        bikeIdInput.value = order.bikeId;
        window.editingIndex = index;
        orderForm.scrollIntoView();
        updateTotalTips();
    }

    window.deleteOrder = function(index){
        if(!confirm("Are you sure you want to delete this order?")) return;
        window._appOrders.splice(index,1);
        saveData();
        displayOrders();
        updateTotalTips();
    }

    function updateTotalTips(){
        if(!resultsDiv || !totalTipsSpan) return;

        // Reset per-bike totals
        const totals = {0:0,1:0,2:0,3:0,4:0,5:0};
        window._appOrders.forEach(order=>{
            totals[order.bikeId] += order.tipAmount;
        });

        // Include current input if valid
        const bikeId = parseInt(bikeIdInput.value);
        const tip = parseFloat(tipAmountInput.value) || 0;
        if(!isNaN(bikeId) && bikeIdNames.hasOwnProperty(bikeId)){
            totals[bikeId] += tip;
        }

        // Update per-bike display
        resultsDiv.innerHTML='<div class="transaction-header2"><div class="header-item2">Bike ID</div><div class="header-item2">Name</div><div class="header-item2">Total Tips</div></div>';
        Object.keys(bikeIdNames).forEach(id=>{
            const row=document.createElement('div');
            row.className='transaction-row2';
            row.innerHTML=`<div class="row-item2">${id}</div><div class="row-item2">${bikeIdNames[id]}</div><div class="row-item2">$${totals[id].toFixed(2)}</div>`;
            resultsDiv.appendChild(row);
        });

        // Update grand total
        const grandTotal = Object.values(totals).reduce((sum,val)=>sum+val,0);
        totalTipsSpan.textContent = grandTotal.toFixed(2);
    }

    function saveData(){
        localStorage.setItem('_appOrders',JSON.stringify(window._appOrders));
        localStorage.setItem('_appTotalTipsByBikeId',JSON.stringify(window._appTotalTipsByBikeId));
    }

});
