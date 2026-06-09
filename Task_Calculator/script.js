// ========== DOM ELEMENTS ==========
const expressionElement = document.getElementById('expression');
const resultElement = document.getElementById('result');

// Calculator state
let currentExpression = '';
let lastResult = null;
let waitingForOperand = false;

// ========== UPDATE DISPLAY ==========
function updateDisplay() {
    if (currentExpression === '') {
        expressionElement.textContent = '0';
    } else {
        expressionElement.textContent = currentExpression;
    }
}

function updateResult(value) {
    resultElement.textContent = value;
}

// ========== EVALUATE EXPRESSION ==========
function evaluateExpression() {
    if (currentExpression === '') {
        return;
    }
    
    try {
        // Replace visual operators with JavaScript operators
        let expressionToEvaluate = currentExpression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/%/g, '/100');
        
        // Evaluate the expression
        let result = eval(expressionToEvaluate);
        
        // Handle division by zero
        if (!isFinite(result)) {
            updateResult('Error');
            return;
        }
        
        // Round to avoid floating point issues
        result = Math.round(result * 1000000) / 1000000;
        
        // Update result display
        updateResult(result);
        lastResult = result;
        
        return result;
    } catch (error) {
        updateResult('Error');
        return null;
    }
}

// ========== HANDLE NUMBER INPUT ==========
function handleNumber(number) {
    if (waitingForOperand) {
        currentExpression = '';
        waitingForOperand = false;
    }
    
    currentExpression += number;
    updateDisplay();
    evaluateExpression();
}

// ========== HANDLE OPERATOR ==========
function handleOperator(operator) {
    if (currentExpression === '') {
        return;
    }
    
    // Convert operator symbol
    let opSymbol;
    switch(operator) {
        case '*': opSymbol = '×'; break;
        case '/': opSymbol = '÷'; break;
        default: opSymbol = operator;
    }
    
    // Check if last character is an operator
    const lastChar = currentExpression[currentExpression.length - 1];
    if (['+', '-', '×', '÷'].includes(lastChar)) {
        // Replace last operator
        currentExpression = currentExpression.slice(0, -1) + opSymbol;
    } else {
        currentExpression += opSymbol;
    }
    
    waitingForOperand = false;
    updateDisplay();
    evaluateExpression();
}

// ========== HANDLE DECIMAL POINT ==========
function handleDecimal() {
    if (waitingForOperand) {
        currentExpression = '0';
        waitingForOperand = false;
    }
    
    // Get current number
    const parts = currentExpression.split(/[\+\-×÷]/);
    const currentNumber = parts[parts.length - 1];
    
    if (!currentNumber.includes('.')) {
        if (currentNumber === '') {
            currentExpression += '0.';
        } else {
            currentExpression += '.';
        }
    }
    
    updateDisplay();
}

// ========== HANDLE PERCENT ==========
function handlePercent() {
    if (currentExpression === '') {
        return;
    }
    
    try {
        let expressionToEvaluate = currentExpression
            .replace(/×/g, '*')
            .replace(/÷/g, '/');
        
        let value = eval(expressionToEvaluate);
        let percentValue = value / 100;
        
        currentExpression = percentValue.toString();
        updateDisplay();
        evaluateExpression();
    } catch (error) {
        updateResult('Error');
    }
}

// ========== HANDLE SIGN TOGGLE (±) ==========
function handleSignToggle() {
    if (currentExpression === '') {
        return;
    }
    
    try {
        let expressionToEvaluate = currentExpression
            .replace(/×/g, '*')
            .replace(/÷/g, '/');
        
        let value = eval(expressionToEvaluate);
        let toggledValue = -value;
        
        currentExpression = toggledValue.toString();
        updateDisplay();
        evaluateExpression();
    } catch (error) {
        updateResult('Error');
    }
}

// ========== HANDLE DELETE (Backspace) ==========
function handleDelete() {
    currentExpression = currentExpression.slice(0, -1);
    updateDisplay();
    
    if (currentExpression === '') {
        updateResult('');
        resultElement.textContent = '';
    } else {
        evaluateExpression();
    }
}

// ========== HANDLE CLEAR ==========
function handleClear() {
    currentExpression = '';
    waitingForOperand = false;
    updateDisplay();
    updateResult('');
}

// ========== HANDLE CLEAR ALL ==========
function handleClearAll() {
    currentExpression = '';
    waitingForOperand = false;
    lastResult = null;
    updateDisplay();
    updateResult('');
}

// ========== HANDLE PARENTHESES ==========
function handleOpenParen() {
    if (waitingForOperand) {
        currentExpression = '';
        waitingForOperand = false;
    }
    currentExpression += '(';
    updateDisplay();
}

function handleCloseParen() {
    currentExpression += ')';
    updateDisplay();
    evaluateExpression();
}

// ========== HANDLE ANS (Last Result) ==========
function handleAns() {
    if (lastResult !== null) {
        if (waitingForOperand) {
            currentExpression = '';
            waitingForOperand = false;
        }
        currentExpression += lastResult.toString();
        updateDisplay();
        evaluateExpression();
    }
}

// ========== HANDLE EQUALS ==========
function handleEquals() {
    if (currentExpression === '') {
        return;
    }
    
    try {
        let expressionToEvaluate = currentExpression
            .replace(/×/g, '*')
            .replace(/÷/g, '/');
        
        let result = eval(expressionToEvaluate);
        
        if (!isFinite(result)) {
            updateResult('Error');
            return;
        }
        
        result = Math.round(result * 1000000) / 1000000;
        updateResult(result);
        lastResult = result;
        
        // Set expression to result for continued calculation
        currentExpression = result.toString();
        updateDisplay();
        waitingForOperand = true;
    } catch (error) {
        updateResult('Error');
    }
}

// ========== EVENT LISTENERS ==========
// Number buttons
document.querySelectorAll('.btn-number').forEach(button => {
    button.addEventListener('click', () => {
        const number = button.getAttribute('data-number');
        if (number === '.') {
            handleDecimal();
        } else {
            handleNumber(number);
        }
    });
});

// Operator buttons
document.querySelectorAll('.btn-operator').forEach(button => {
    button.addEventListener('click', () => {
        const operator = button.getAttribute('data-operator');
        handleOperator(operator);
    });
});

// Special function buttons
document.querySelectorAll('.btn-special').forEach(button => {
    button.addEventListener('click', () => {
        const action = button.getAttribute('data-action');
        switch(action) {
            case 'clear':
                handleClear();
                break;
            case 'delete':
                handleDelete();
                break;
            case 'percent':
                handlePercent();
                break;
            case 'sign':
                handleSignToggle();
                break;
        }
    });
});

// Equals button
document.querySelector('.btn-equals').addEventListener('click', () => {
    handleEquals();
});

// Extra buttons
document.querySelectorAll('.btn-extra').forEach(button => {
    button.addEventListener('click', () => {
        const action = button.getAttribute('data-action');
        switch(action) {
            case 'openParen':
                handleOpenParen();
                break;
            case 'closeParen':
                handleCloseParen();
                break;
            case 'ans':
                handleAns();
                break;
            case 'clearAll':
                handleClearAll();
                break;
        }
    });
});

// ========== KEYBOARD SUPPORT ==========
document.addEventListener('keydown', (event) => {
    const key = event.key;
    
    // Numbers
    if (/[0-9]/.test(key)) {
        event.preventDefault();
        handleNumber(key);
    }
    // Operators
    else if (key === '+') {
        event.preventDefault();
        handleOperator('+');
    }
    else if (key === '-') {
        event.preventDefault();
        handleOperator('-');
    }
    else if (key === '*') {
        event.preventDefault();
        handleOperator('*');
    }
    else if (key === '/') {
        event.preventDefault();
        handleOperator('/');
    }
    // Decimal
    else if (key === '.') {
        event.preventDefault();
        handleDecimal();
    }
    // Enter or = for equals
    else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        handleEquals();
    }
    // Backspace for delete
    else if (key === 'Backspace') {
        event.preventDefault();
        handleDelete();
    }
    // Escape for clear
    else if (key === 'Escape') {
        event.preventDefault();
        handleClear();
    }
    // Percent
    else if (key === '%') {
        event.preventDefault();
        handlePercent();
    }
    // Parentheses
    else if (key === '(') {
        event.preventDefault();
        handleOpenParen();
    }
    else if (key === ')') {
        event.preventDefault();
        handleCloseParen();
    }
});

// ========== INITIAL DISPLAY ==========
updateDisplay();