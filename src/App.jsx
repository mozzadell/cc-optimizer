import React, { useState } from 'react';
import './App.css';
import { Menu, X, Home } from 'lucide-react';

function App() {
  const [spending, setSpending] = useState({
    groceries: '',
    dining: '',
    gas: '',
    flights: '',
    hotels: '',
    streaming: '',
    entertainment: '',
    transit: '',
    phone: '',
    online_retail: '',
    drugstore: '',
    other: ''
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [excludeAnnualFees, setExcludeAnnualFees] = useState(false);
  const [maxAnnualFee, setMaxAnnualFee] = useState(895);
  const [isAnnualSpending, setIsAnnualSpending] = useState(false);
  const [showMultiCard, setShowMultiCard] = useState(false);
  const [showCustomPortfolio, setShowCustomPortfolio] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const categories = [
    { key: 'groceries', label: 'Groceries', icon: '🛒', placeholder: '500', tooltip: 'Supermarkets, grocery stores, food markets' },
    { key: 'dining', label: 'Dining & Restaurants', icon: '🍽️', placeholder: '300', tooltip: 'Restaurants, bars, cafes, food delivery' },
    { key: 'gas', label: 'Gas & Fuel', icon: '⛽', placeholder: '150', tooltip: 'Gas stations, fuel purchases' },
    { key: 'flights', label: 'Flights', icon: '🛫', placeholder: '200', tooltip: 'Airline tickets, flight bookings' },
    { key: 'hotels', label: 'Hotels', icon: '🏨', placeholder: '150', tooltip: 'Hotel stays, lodging, resorts' },
    { key: 'streaming', label: 'Streaming Services', icon: '📺', placeholder: '50', tooltip: 'Netflix, Hulu, Disney+, Spotify, etc.' },
    { key: 'entertainment', label: 'Entertainment', icon: '🎬', placeholder: '100', tooltip: 'Movies, concerts, events, tickets' },
    { key: 'transit', label: 'Transit/Public Transport', icon: '🚇', placeholder: '50', tooltip: 'Subway, bus, train, rideshares' },
    { key: 'phone', label: 'Phone Plans', icon: '📱', placeholder: '80', tooltip: 'Cell phone bills, mobile service' },
    { key: 'online_retail', label: 'Online Retail', icon: '🛍️', placeholder: '150', tooltip: 'Amazon, online shopping, e-commerce' },
    { key: 'drugstore', label: 'Drugstores/Pharmacies', icon: '💊', placeholder: '50', tooltip: 'CVS, Walgreens, pharmacies' },
    { key: 'other', label: 'Other Purchases', icon: '💳', placeholder: '200', tooltip: 'Everything else not in other categories' }
  ];

  const handleInputChange = (category, value) => {
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
      const payload = {
        spending: spendingData,
        is_annual: isAnnualSpending
      };
      
      if (excludeAnnualFees) {
        payload.max_annual_fee = 0;
      } else if (maxAnnualFee < 895) {
        payload.max_annual_fee = maxAnnualFee;
      }

      const response = await fetch('https://mozzadell.pythonanywhere.com/api/optimize-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
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
      flights: '',
      hotels: '',
      streaming: '',
      entertainment: '',
      transit: '',
      phone: '',
      online_retail: '',
      drugstore: '',
      other: ''
    });
    setResults(null);
    setError(null);
    setExcludeAnnualFees(false);
    setMaxAnnualFee(895);
    setSelectedCards([]);
  };

  const toggleCardSelection = (cardId) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const calculateCustomPortfolio = () => {
    if (!results || selectedCards.length === 0) return null;

    const selectedCardData = results.recommendations.filter(card => 
      selectedCards.includes(card.card_id)
    );

    const totalRewards = selectedCardData.reduce((sum, card) => sum + card.annual_rewards, 0);
    const totalFees = selectedCardData.reduce((sum, card) => sum + card.annual_fee, 0);
    const totalCredits = selectedCardData.reduce((sum, card) => sum + card.credits, 0);
    const netValue = totalRewards + totalCredits - totalFees;

    return {
      cards: selectedCardData,
      totalRewards,
      totalFees,
      totalCredits,
      netValue
    };
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
      {/* Navigation Header */}
      <nav className="nav-header">
        <div className="nav-container">
          <a href="https://mozzadell.github.io/finch" className="back-to-hub">
            <Home className="w-5 h-5" />
            <span>Back to Hub</span>
          </a>
          
          <button 
            className="hamburger-menu"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {menuOpen && (
          <div className="dropdown-menu">
            <a href="https://mozzadell.github.io/finch" className="menu-item">
              <div className="menu-item-content">
                <span className="menu-item-title">FINCH</span>
                <span className="menu-item-subtitle">Financial Clarity Hub</span>
              </div>
            </a>
            <a href="https://mozzadell.github.io/stock-calculator" className="menu-item">
              <div className="menu-item-content">
                <span className="menu-item-title">Stock Calculator</span>
                <span className="menu-item-subtitle">Dividend Reinvestment Analysis</span>
              </div>
            </a>
            <a href="https://mozzadell.github.io/cc-optimizer" className="menu-item current-page">
              <div className="menu-item-content">
                <span className="menu-item-title">Credit Card Optimizer</span>
                <span className="menu-item-subtitle">Maximize Your Rewards</span>
              </div>
            </a>
            <a href="https://mozzadell.github.io/coffee-calculator" className="menu-item">
              <div className="menu-item-content">
                <span className="menu-item-title">Coffee Calculator</span>
                <span className="menu-item-subtitle">Home Brew vs. Coffee Shop</span>
              </div>
            </a>
          </div>
        )}
      </nav>

      <div className="container">
        <div className="content">
          <header className="header">
            <h1>
              <i className="fas fa-credit-card"></i>
              Credit Card Rewards Optimizer
            </h1>
          </header>

          {/* Input Form */}
          <div className="input-section">
            <h2>Enter Your {isAnnualSpending ? 'Annual' : 'Monthly'} Spending</h2>
            
            <div className="spending-toggle">
              <button 
                className={`toggle-btn ${!isAnnualSpending ? 'active' : ''}`}
                onClick={() => setIsAnnualSpending(false)}
                type="button"
              >
                Monthly
              </button>
              <button 
                className={`toggle-btn ${isAnnualSpending ? 'active' : ''}`}
                onClick={() => setIsAnnualSpending(true)}
                type="button"
              >
                Annual
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="spending-grid">
                {categories.map(cat => (
                  <div key={cat.key} className="input-group">
                    <div className="label-row">
                      <label>
                        <span className="category-icon">{cat.icon}</span>
                        <span className="category-label">{cat.label}</span>
                      </label>
                      <div className="info-tooltip">
                        <span className="info-icon">ℹ️</span>
                        <span className="tooltip-text">{cat.tooltip}</span>
                      </div>
                    </div>
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

              {/* Annual Fee Filter */}
              <div className="filter-section">
                <h3>Annual Fee Filter</h3>
                
                <div className="filter-toggle">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={excludeAnnualFees}
                      onChange={(e) => setExcludeAnnualFees(e.target.checked)}
                    />
                    <span>Only show cards with $0 annual fee</span>
                  </label>
                </div>

                {!excludeAnnualFees && (
                  <div className="slider-container">
                    <label>Maximum Annual Fee: <strong>${maxAnnualFee}</strong></label>
                    <input
                      type="range"
                      min="0"
                      max="895"
                      step="5"
                      value={maxAnnualFee}
                      onChange={(e) => setMaxAnnualFee(parseInt(e.target.value))}
                      className="fee-slider"
                    />
                    <div className="slider-labels">
                      <span>$0</span>
                      <span>$895</span>
                    </div>
                  </div>
                )}
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
              {console.log("RESULTS SECTION RENDERING", results)}
              {/* Summary */}
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

              {/* Results View Toggle */}
              <div className="strategy-toggle">
                <button 
                  className={`toggle-btn ${!showMultiCard && !showCustomPortfolio ? 'active' : ''}`}
                  onClick={() => {
                    setShowMultiCard(false);
                    setShowCustomPortfolio(false);
                  }}
                >
                  Individual Cards
                </button>
                {results.multi_card_strategies && results.multi_card_strategies.length > 0 && (
                  <button 
                    className={`toggle-btn ${showMultiCard ? 'active' : ''}`}
                    onClick={() => {
                      setShowMultiCard(true);
                      setShowCustomPortfolio(false);
                    }}
                  >
                    Multi-Card Strategies
                  </button>
                )}
                <button 
                  className={`toggle-btn ${showCustomPortfolio ? 'active' : ''}`}
                  onClick={() => {
                    setShowMultiCard(false);
                    setShowCustomPortfolio(true);
                  }}
                >
                  Custom Portfolio
                </button>
              </div>

              {showCustomPortfolio ? (
                <div className="custom-portfolio-section">
                  <h2>🎯 Build Your Custom Portfolio</h2>
                  <p className="section-subtitle">Select cards to create your own custom combination</p>
                  
                  {selectedCards.length > 0 && (() => {
                    const portfolio = calculateCustomPortfolio();
                    return portfolio && (
                      <div className="portfolio-summary">
                        <div className="summary-stats">
                          <div className="stat">
                            <span className="stat-label">Total Annual Rewards</span>
                            <span className="stat-value positive">{formatCurrency(portfolio.totalRewards)}</span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">Total Annual Fees</span>
                            <span className="stat-value negative">{formatCurrency(portfolio.totalFees)}</span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">Total Credits</span>
                            <span className="stat-value positive">{formatCurrency(portfolio.totalCredits)}</span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">Net Annual Value</span>
                            <span className="stat-value highlight">{formatCurrency(portfolio.netValue)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div className="custom-portfolio-cards">
                    {results.recommendations.map((card) => (
                      <div 
                        key={card.card_id} 
                        className={`portfolio-card-item ${selectedCards.includes(card.card_id) ? 'selected' : ''}`}
                        onClick={() => toggleCardSelection(card.card_id)}
                      >
                        <div className="portfolio-card-checkbox">
                          <input 
                            type="checkbox" 
                            checked={selectedCards.includes(card.card_id)}
                            onChange={() => {}}
                          />
                        </div>
                        <div className="portfolio-card-info">
                          <h4>{card.card_name}</h4>
                          <div className="portfolio-card-stats">
                            <span className="portfolio-stat">{formatCurrency(card.annual_rewards)} rewards</span>
                            <span className="portfolio-stat negative">{formatCurrency(card.annual_fee)} fee</span>
                            <span className="portfolio-stat positive">{formatCurrency(card.credits)} credits</span>
                            <span className="portfolio-stat highlight">{formatCurrency(card.net_rewards)} net</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : !showMultiCard ? (
                <>
              <h2>🏆 Top Credit Card Recommendations</h2>
              <p className="results-subtitle">Ranked by net annual value (rewards minus fees plus credits)</p>

              <div className="cards-list">
                {results.recommendations.map((card, index) => (
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
                        <div className="earning-rate-display">{card.earning_display}</div>
                      </div>
                    </div>

                    <div className="card-stats">
                      <div className="stat-row">
                        <span className="stat-label">Annual Rewards</span>
                        <span className="stat-value highlight">
                          {formatCurrency(card.annual_rewards)}
                        </span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Annual Fee</span>
                        <span className="stat-value">
                          {card.annual_fee > 0 ? formatCurrency(card.annual_fee) : '$0'}
                        </span>
                      </div>
                      {card.credits > 0 && (
                        <div className="stat-row">
                          <span className="stat-label">
                            Annual Credits
                            {card.total_possible_credits > card.credits && " (Conditional)"}
                          </span>
                          <span className="stat-value positive">
                            +{formatCurrency(card.credits)}
                            {card.total_possible_credits > card.credits && 
                              <span className="credit-note"> of ${card.total_possible_credits}</span>
                            }
                          </span>
                        </div>
                      )}
                      
                      {card.credit_breakdown && card.credit_breakdown.length > 0 && (
                        <div className="credit-breakdown-row">
                          <span className="credit-label">Credits Counted:</span>
                          <div className="credit-list">
                            {card.credit_breakdown.map((credit, idx) => (
                              <span key={idx} className="credit-item">{credit}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {card.spending_caps && card.spending_caps.length > 0 && (
                        <div className="spending-caps-row">
                          <span className="caps-label">Spending Caps:</span>
                          <div className="caps-list">
                            {card.spending_caps.map((cap, idx) => (
                              <span key={idx} className="cap-item">{cap}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="stat-row total">
                        <span className="stat-label">Net Annual Value</span>
                        <span className="stat-value">
                          {formatCurrency(card.net_rewards)}
                        </span>
                      </div>
                    </div>

                    <div className="rewards-breakdown">
                      <h4>Category Breakdown:</h4>
                      <div className="breakdown-grid">
                        {card.breakdown_with_rates ? 
                          Object.entries(card.breakdown_with_rates)
                            .filter(([_, data]) => data.amount > 0)
                            .sort((a, b) => b[1].amount - a[1].amount)
                            .map(([category, data]) => (
                              <div key={category} className="breakdown-item">
                                <span className="breakdown-category">
                                  {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                                </span>
                                <span className="breakdown-rate">{data.rate}</span>
                                <span className="breakdown-amount">
                                  {formatCurrency(data.amount)}
                                </span>
                              </div>
                            ))
                          :
                          Object.entries(card.breakdown)
                            .filter(([_, value]) => value > 0)
                            .sort((a, b) => b[1] - a[1])
                            .map(([category, amount]) => (
                              <div key={category} className="breakdown-item">
                                <span className="breakdown-category">
                                  {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                                </span>
                                <span className="breakdown-amount">
                                  {formatCurrency(amount)}
                                </span>
                              </div>
                            ))
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              </>
              ) : (
                <div className="multi-card-section">
                  <h2>💼 Multi-Card Strategies</h2>
                  <p className="section-subtitle">Optimize rewards by using multiple cards</p>
                  
                  {results.multi_card_strategies.map((strategy, idx) => (
                    <div key={idx} className="strategy-card">
                      <div className="strategy-header">
                        <h3>{strategy.name}</h3>
                        <p className="strategy-description">{strategy.description}</p>
                      </div>
                      
                      <div className="strategy-summary">
                        <div className="strategy-stat">
                          <span className="label">Net Annual Value</span>
                          <span className="value highlight">{formatCurrency(strategy.total_rewards)}</span>
                        </div>
                        <div className="strategy-stat">
                          <span className="label">Total Annual Fees</span>
                          <span className="value negative">{formatCurrency(strategy.total_fees)}</span>
                        </div>
                        <div className="strategy-stat">
                          <span className="label">Total Credits</span>
                          <span className="value positive">{formatCurrency(strategy.total_credits)}</span>
                        </div>
                      </div>
                      
                      <div className="strategy-cards">
                        {strategy.cards.map((card, cardIdx) => (
                          <div key={cardIdx} className="strategy-card-item">
                            <div className="card-badge">Card {cardIdx + 1}</div>
                            <div className="card-info">
                              <h4>{card.card_name}</h4>
                              <div className="earning-rate">{card.earning_display}</div>
                              <div className="card-quick-stats">
                                <span>Value: {formatCurrency(card.net_rewards)}</span>
                                <span>Fee: {formatCurrency(card.annual_fee)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="info-box">
                <h4>💡 Understanding Your Results</h4>
                <ul>
                  <li><strong>Annual Rewards:</strong> Cash back or points value earned from your spending</li>
                  <li><strong>Annual Credits:</strong> Statement credits that effectively lower the annual fee</li>
                  <li><strong>Conditional Credits:</strong> Only counted if you meet minimum spending thresholds</li>
                  <li><strong>Net Annual Value:</strong> Total value after subtracting fees and adding credits</li>
                  <li><strong>Spending Caps:</strong> Maximum amounts where bonus rates apply</li>
                </ul>
              </div>
            </div>
          )}

          <footer className="footer">
            <p>💡 Tip: Enter your typical monthly spending to find cards that match your lifestyle</p>
            <p className="small-disclaimer">
              All trademarks and registered marks are property of their respective owners. 
              Rewards estimates are for informational purposes only.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
