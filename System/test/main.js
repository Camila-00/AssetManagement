const { calculateTax } = require('./utils');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter subtotal: ', (subtotal) => {
  rl.question('Enter tax rate (as a decimal): ', (taxRate) => {
    const total = parseFloat(subtotal) + calculateTax(parseFloat(subtotal), parseFloat(taxRate));

    console.log(`Total with tax: $${total.toFixed(2)}`);
    rl.close();
  });
});
