  function calculateAdvancedLoan() {
    const price = parseFloat(document.getElementById('loanAmount').value);
    const down = parseFloat(document.getElementById('downPayment').value);
    const rate = parseFloat(document.getElementById('interestRate').value) / 100;
    const years = parseFloat(document.getElementById('loanTerm').value);
    const taxes = parseFloat(document.getElementById('propertyTax').value);
    const insurance = parseFloat(document.getElementById('homeInsurance').value);
    const hoa = parseFloat(document.getElementById('hoaFees').value);

    if (isNaN(price) || isNaN(down) || isNaN(rate) || isNaN(years)) {
      document.getElementById('totalMonthly').textContent = 'Please fill in all required fields.';
      return;
    }

    const loanAmount = price - down;
    const monthlyRate = rate / 12;
    const totalPayments = years * 12;

    const principalInterest = 
      (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalPayments));

    const monthlyTaxes = taxes / 12 || 0;
    const monthlyInsurance = insurance / 12 || 0;
    const monthlyHOA = hoa || 0;

    const totalMonthly = principalInterest + monthlyTaxes + monthlyInsurance + monthlyHOA;

    document.getElementById('totalMonthly').textContent = 
      `Estimated Monthly Payment: $${totalMonthly.toFixed(2)}`;

    document.getElementById('breakdown').innerHTML = `
      <strong>Breakdown:</strong><br>
      Principal & Interest: $${principalInterest.toFixed(2)}<br>
      Property Taxes: $${monthlyTaxes.toFixed(2)}<br>
      Insurance: $${monthlyInsurance.toFixed(2)}<br>
      HOA Fees: $${monthlyHOA.toFixed(2)}
    `;
  }