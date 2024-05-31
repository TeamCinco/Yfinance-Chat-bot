import React, { useState } from 'react';

const UserInput = ({ onSubmit }) => {
  const [ticker, setTicker] = useState('');
  const [statementType, setStatementType] = useState('');
  const [frequency, setFrequency] = useState('annual');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(ticker, statementType, frequency);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Ticker Symbol:
        <input type="text" value={ticker} onChange={(e) => setTicker(e.target.value)} required />
      </label>
      <label>
        Financial Statement:
        <select value={statementType} onChange={(e) => setStatementType(e.target.value)} required>
          <option value="">Select a statement</option>
          <option value="balanceSheet">Balance Sheet</option>
          <option value="incomeStatement">Income Statement</option>
          <option value="cashflowStatement">Cashflow Statement</option>
        </select>
      </label>
      <label>
        Frequency:
        <select value={frequency} onChange={(e) => setFrequency(e.target.value)} required>
          <option value="annual">Annual</option>
          <option value="quarterly">Quarterly</option>
        </select>
      </label>
      <button type="submit">Submit</button>
    </form>
  );
};

export default UserInput;
