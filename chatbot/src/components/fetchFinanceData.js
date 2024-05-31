const fetchFinancialStatement = async (ticker, statementType, frequency) => {
  const apiUrl = `http://localhost:8000/financial_statement?ticker=${ticker}&statement=${statementType}&frequency=${frequency}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch financial statement:', error);
    return null;
  }
};

export default fetchFinancialStatement;
