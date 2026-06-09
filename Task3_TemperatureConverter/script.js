// ========== DOM ELEMENTS ==========
const temperatureInput = document.getElementById('temperatureInput');
const fromUnitSelect = document.getElementById('fromUnit');
const toUnitSelect = document.getElementById('toUnit');
const convertBtn = document.getElementById('convertBtn');
const resetBtn = document.getElementById('resetBtn');
const resultValue = document.getElementById('resultValue');
const resultUnit = document.getElementById('resultUnit');
const resultBox = document.getElementById('resultBox');
const formulaDisplay = document.getElementById('formulaDisplay');
const errorDiv = document.getElementById('inputError');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const themeToggle = document.getElementById('themeToggle');

// ========== CONVERSION HISTORY ==========
let conversionHistory = [];

// ========== LOAD HISTORY FROM LOCAL STORAGE ==========
function loadHistory() {
    const saved = localStorage.getItem('tempConverterHistory');
    if (saved) {
        conversionHistory = JSON.parse(saved);
        renderHistory();
    }
}

// ========== SAVE HISTORY TO LOCAL STORAGE ==========
function saveHistory() {
    localStorage.setItem('tempConverterHistory', JSON.stringify(conversionHistory));
}

// ========== ADD TO HISTORY ==========
function addToHistory(fromValue, fromUnit, toValue, toUnit) {
    const unitSymbols = {
        celsius: '°C',
        fahrenheit: '°F',
        kelvin: 'K'
    };
    
    const historyItem = {
        id: Date.now(),
        fromValue: fromValue,
        fromUnit: unitSymbols[fromUnit],
        toValue: toValue,
        toUnit: unitSymbols[toUnit],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    conversionHistory.unshift(historyItem);
    
    // Keep only last 10 items
    if (conversionHistory.length > 10) {
        conversionHistory.pop();
    }
    
    saveHistory();
    renderHistory();
}

// ========== RENDER HISTORY ==========
function renderHistory() {
    if (conversionHistory.length === 0) {
        historyList.innerHTML = `
            <div class="empty-history">
                <p>No conversions yet</p>
                <small>Convert something to see history</small>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = conversionHistory.map(item => `
        <div class="history-item">
            <div class="history-value">
                ${item.fromValue} ${item.fromUnit} → ${item.toValue} ${item.toUnit}
            </div>
            <div class="history-date">${item.timestamp}</div>
        </div>
    `).join('');
}

// ========== CLEAR HISTORY ==========
function clearHistory() {
    conversionHistory = [];
    saveHistory();
    renderHistory();
}

// ========== CONVERSION FUNCTIONS ==========
function celsiusToFahrenheit(c) { return (c * 9/5) + 32; }
function celsiusToKelvin(c) { return c + 273.15; }
function fahrenheitToCelsius(f) { return (f - 32) * 5/9; }
function fahrenheitToKelvin(f) { return (f - 32) * 5/9 + 273.15; }
function kelvinToCelsius(k) { return k - 273.15; }
function kelvinToFahrenheit(k) { return (k - 273.15) * 9/5 + 32; }

// ========== GET FORMULA TEXT ==========
function getFormulaText(fromUnit, toUnit) {
    const formulas = {
        'celsius_fahrenheit': '(°C × 9/5) + 32 = °F',
        'celsius_kelvin': '°C + 273.15 = K',
        'fahrenheit_celsius': '(°F - 32) × 5/9 = °C',
        'fahrenheit_kelvin': '(°F - 32) × 5/9 + 273.15 = K',
        'kelvin_celsius': 'K - 273.15 = °C',
        'kelvin_fahrenheit': '(K - 273.15) × 9/5 + 32 = °F'
    };
    
    const key = `${fromUnit}_${toUnit}`;
    return formulas[key] || 'Select units to see formula';
}

// ========== UNIT SYMBOLS ==========
const unitSymbols = {
    celsius: '°C',
    fahrenheit: '°F',
    kelvin: 'K'
};

// ========== MAIN CONVERSION FUNCTION ==========
function convertTemperature() {
    // Get input value
    let inputValue = parseFloat(temperatureInput.value);
    
    // Validation
    if (isNaN(inputValue) || temperatureInput.value === '') {
        errorDiv.classList.remove('hidden');
        resultValue.textContent = '---';
        resultUnit.textContent = '';
        formulaDisplay.textContent = 'Enter a valid number to see formula';
        return;
    }
    
    errorDiv.classList.add('hidden');
    
    const fromUnit = fromUnitSelect.value;
    const toUnit = toUnitSelect.value;
    
    let convertedValue;
    
    // Perform conversion
    if (fromUnit === 'celsius') {
        if (toUnit === 'fahrenheit') convertedValue = celsiusToFahrenheit(inputValue);
        else if (toUnit === 'kelvin') convertedValue = celsiusToKelvin(inputValue);
        else convertedValue = inputValue;
    }
    else if (fromUnit === 'fahrenheit') {
        if (toUnit === 'celsius') convertedValue = fahrenheitToCelsius(inputValue);
        else if (toUnit === 'kelvin') convertedValue = fahrenheitToKelvin(inputValue);
        else convertedValue = inputValue;
    }
    else if (fromUnit === 'kelvin') {
        if (toUnit === 'celsius') convertedValue = kelvinToCelsius(inputValue);
        else if (toUnit === 'fahrenheit') convertedValue = kelvinToFahrenheit(inputValue);
        else convertedValue = inputValue;
    }
    
    // Format result
    const formattedResult = convertedValue.toFixed(4);
    
    // Update display with animation
    resultValue.textContent = formattedResult;
    resultUnit.textContent = unitSymbols[toUnit];
    
    // Add animation
    resultBox.classList.add('animate');
    setTimeout(() => {
        resultBox.classList.remove('animate');
    }, 400);
    
    // Update formula
    formulaDisplay.textContent = getFormulaText(fromUnit, toUnit);
    
    // Add to history
    addToHistory(inputValue, fromUnit, formattedResult, toUnit);
}

// ========== RESET FUNCTION ==========
function resetForm() {
    temperatureInput.value = '';
    fromUnitSelect.value = 'celsius';
    toUnitSelect.value = 'fahrenheit';
    resultValue.textContent = '---';
    resultUnit.textContent = '°F';
    formulaDisplay.textContent = '(°C × 9/5) + 32 = °F';
    errorDiv.classList.add('hidden');
}

// ========== DARK MODE TOGGLE ==========
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.textContent = isDark ? 'Light' : 'Dark';
    
    // Save preference
    localStorage.setItem('darkMode', isDark);
}

// ========== LOAD DARK MODE PREFERENCE ==========
function loadDarkModePreference() {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = 'Light';
    }
}

// ========== UPDATE FORMULA ON UNIT CHANGE ==========
function updateFormula() {
    const fromUnit = fromUnitSelect.value;
    const toUnit = toUnitSelect.value;
    formulaDisplay.textContent = getFormulaText(fromUnit, toUnit);
    
    if (temperatureInput.value !== '') {
        convertTemperature();
    }
}

// ========== EVENT LISTENERS ==========
convertBtn.addEventListener('click', convertTemperature);
resetBtn.addEventListener('click', resetForm);
clearHistoryBtn.addEventListener('click', clearHistory);
themeToggle.addEventListener('click', toggleTheme);
fromUnitSelect.addEventListener('change', updateFormula);
toUnitSelect.addEventListener('change', updateFormula);

// Enter key support
temperatureInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        convertTemperature();
    }
});

// ========== INITIALIZATION ==========
function init() {
    loadHistory();
    loadDarkModePreference();
    formulaDisplay.textContent = '(°C × 9/5) + 32 = °F';
}

init();