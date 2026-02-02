import React, { useState } from 'react';
import './App.css';

function App() {
  const [spending, setSpending] = useState({
    groceries: '',
    dining: '',
    gas: '',
    travel: '',
    streaming: '',
    entertainment: '',
    other: ''
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    { key: 'groceries', label: 'Groceries', icon: '🛒', placeholder: '500' },
    { key: 'dining', label: 'Dining & Restaurants', icon: '🍽️', placeholder: '300' },
    { key: 'gas', label: 'Gas & Fuel', icon: '⛽', placeholder: '150' },
    { key: 'travel', label: 'Travel & Hotels', icon: '✈️', placeholder: '200' },
    { key: 'streaming', label: 'Streaming Services', icon: '📺', placeholder: '50' },
    { key: 'entertainment', label: 'Entertainment', icon: '🎬', placeholder: '100' },
    { key: 'other', label: 'Other Purchases', icon: '🛍️', placeholder: '200' }
  ];

  const handleInputChange = (category, value) => {
    // Only allow numbers and decimals
    const numericValue = value.replace(/[^0-9.]/g, '');
    setSpending(prev => ({
      ...prev,
      [category]: numericValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    // Convert spending to numbers
    const spendingData = {};
    let hasValue = false;
    
    for (const [key, value] of Object.entries(spending)) {
      const numValue = parseFloat(value) || 0;
      spendingData[key] = numValue;
      if (numValue > 0) hasValue = true;
    }

    if (!hasValue) {
      setError('Please enter at least one spending amount');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://mozzadell.pythonanywhere.com/api/optimize-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spending: spendingData })
      });

      const data = await response.json();

      if (data.success) {
        setResults(data);
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (err) {
      setError('Failed to connect to server. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSpending({
      groceries: '',
      dining: '',
      gas: '',
      travel: '',
      streaming: '',
      entertainment: '',
      other: ''
    });
    setResults(null);
    setError(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>💳 Credit Card Rewards Optimizer</h1>
          <p>Find the best credit cards for your spending habits</p>
        </header>

        <div className="content">
          {/* Input Form */}
          <div className="input-section">
            <h2>Enter Your Monthly Spending</h2>
            <form onSubmit={handleSubmit}>
              <div className="spending-grid">
                {categories.map(cat => (
                  <div key={cat.key} className="input-group">
                    <label>
                      <span className="category-icon">{cat.icon}</span>
                      <span className="category-label">{cat.label}</span>
                    </label>
                    <div className="input-wrapper">
                      <span className="currency-symbol">$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder={cat.placeholder}
                        value={spending[cat.key]}
                        onChange={(e) => handleInputChange(cat.key, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <div className="error-message">
                  ⚠️ {error}
                </div>
              )}

              <div className="button-group">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? '⏳ Analyzing...' : '🔍 Find Best Cards'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleReset}>
                  🔄 Reset
                </button>
              </div>
            </form>
          </div>

          {/* Results */}
          {results && (
            <div className="results-section">
              <div className="summary-card">
                <h3>Your Spending Summary</h3>
                <div className="summary-stats">
                  <div className="stat">
                    <span className="stat-label">Monthly Spending</span>
                    <span className="stat-value">{formatCurrency(results.total_monthly_spending)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Annual Spending</span>
                    <span className="stat-value">{formatCurrency(results.total_annual_spending)}</span>
                  </div>
                </div>
              </div>

              <h2>🏆 Recommended Credit Cards</h2>
              <p className="results-subtitle">Cards ranked by net rewards (rewards minus annual fee)</p>

              <div className="cards-list">
                {results.recommendations.slice(0, 10).map((card, index) => (
                  <div key={card.card_id} className={`card-item ${index === 0 ? 'top-pick' : ''}`}>
                    {index === 0 && (
                      <div className="best-badge">
                        ⭐ BEST CHOICE
                      </div>
                    )}
                    
                    <div className="card-header">
                      <div className="card-rank">#{index + 1}</div>
                      <div className="card-name-section">
                        <h3 className="card-name">{card.card_name}</h3>
                        {card.notes && (
                          <p className="card-notes">{card.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="card-stats">
                      <div className="stat-row">
                        <span className="stat-label">Net Rewards (Year 1)</span>
                        <span className="stat-value highlight">
                          {formatCurrency(card.first_year_rewards)}
                        </span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Annual Rewards</span>
                        <span className="stat-value">
                          {formatCurrency(card.annual_rewards)}
                        </span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Annual Fee</span>
                        <span className="stat-value negative">
                          {card.annual_fee > 0 ? `-${formatCurrency(card.annual_fee)}` : '$0'}
                        </span>
                      </div>
                      <div className="stat-row total">
                        <span className="stat-label">Net Value (Annual)</span>
                        <span className="stat-value">
                          {formatCurrency(card.net_rewards)}
                        </span>
                      </div>
                    </div>

                    {card.signup_bonus > 0 && (
                      <div className="signup-bonus">
                        🎁 Signup Bonus: {card.signup_bonus.toLocaleString()} points 
                        (${(card.signup_bonus * 0.01).toLocaleString()} value) 
                        after spending ${card.signup_spend_requirement.toLocaleString()} 
                        in {card.signup_months} months
                      </div>
                    )}

                    <div className="rewards-breakdown">
                      <h4>Rewards Breakdown:</h4>
                      <div className="breakdown-grid">
                        {Object.entries(card.breakdown)
                          .filter(([_, value]) => value > 0)
                          .sort((a, b) => b[1] - a[1])
                          .map(([category, amount]) => (
                            <div key={category} className="breakdown-item">
                              <span className="breakdown-category">
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </span>
                              <span className="breakdown-amount">
                                {formatCurrency(amount)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="info-box">
                <h4>💡 How to Read These Results</h4>
                <ul>
                  <li><strong>Net Rewards (Year 1):</strong> Total value including signup bonus minus annual fee</li>
                  <li><strong>Annual Rewards:</strong> Cash back or points value you'll earn each year</li>
                  <li><strong>Net Value (Annual):</strong> Annual rewards minus annual fee (what you actually gain)</li>
                  <li><strong>Rewards Breakdown:</strong> Shows which spending categories earn you the most</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <footer className="footer">
          <p>💡 Tip: Enter your typical monthly spending to find the best cards for your lifestyle</p>
          <p className="disclaimer">
            Rewards values are estimates. Actual rewards may vary. Always read card terms and conditions.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
