const display = document.getElementById('display');
const themeToggle = document.getElementById('theme-toggle');
const historyList = document.getElementById('history');
let currentInput = '';

themeToggle.addEventListener('change', () => {
    document.documentElement.setAttribute('data-theme', themeToggle.checked ? 'light' : 'dark');
});

function appendNumber(num) {
    currentInput += num;
    updateDisplay();
}

function appendOperator(op) {
    currentInput += op;
    updateDisplay();
}

function appendFunction(fn) {
    currentInput += fn;
    updateDisplay();
}

function appendFraction() {
    const fractionHTML = `
        <span class="fraction" contenteditable="false">
          <span class="top" contenteditable="true" oninput="updateFractions()">?</span>
          <span class="bottom" contenteditable="true" oninput="updateFractions()">?</span>
        </span>
      `;
    const lastChar = display.innerText.slice(-1);
    if (/\d/.test(lastChar)) {
        display.innerHTML += ' ';
    }
    display.innerHTML += fractionHTML;
    updateFractions();
}

function clearDisplay() {
    currentInput = '';
    display.innerHTML = '0';
}

function deleteChar() {
    currentInput = currentInput.slice(0, -1);
    updateDisplay();
}

function updateFractions() {
    const allFractions = display.querySelectorAll('.fraction');
    let result = display.innerHTML;

    allFractions.forEach(f => {
        const top = f.querySelector('.top').textContent || '0';
        const bottom = f.querySelector('.bottom').textContent || '1';
        const fractionStr = `(${top}/${bottom})`;
        const fullHTML = f.outerHTML;

        const regex = new RegExp(`(\\d+)\\s*${escapeRegExp(fullHTML)}`);
        if (regex.test(result)) {
            result = result.replace(regex, `($1+${fractionStr})`);
        } else {
            result = result.replace(fullHTML, fractionStr);
        }
    });

    currentInput = result;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function calculate() {
    updateFractions();
    try {
        const safeInput = convertMixedFractions(currentInput)
            .replace(/\^/g, '**')
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(');

        let result = eval(safeInput);
        if (typeof result === 'number' && !Number.isInteger(result)) {
            result = parseFloat(result.toFixed(10));
        }

        addToHistory(currentInput, result);
        display.innerHTML = result;
        currentInput = result.toString();
    } catch {
        display.innerHTML = 'Error';
        currentInput = '';
    }
}

function convertMixedFractions(input) {
    return input.replace(/(\d+)\s+(\d+)\/(\d+)/g, (_, whole, num, denom) => {
        return `(${whole}+(${num}/${denom}))`;
    });
}

function updateDisplay() {
    display.textContent = currentInput || '0';
}

function addToHistory(expression, result) {
    const li = document.createElement('li');
    li.textContent = `${expression} = ${result}`;
    historyList.prepend(li);
}
