import { useState } from 'react';
import axios from 'axios';
import './SearchBar.css';

function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      console.log('Sending request to:', `/api/SearchFunction?query=${encodeURIComponent(query)}`);
      const response = await axios.get(`/api/SearchFunction?query=${encodeURIComponent(query)}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('Search response:', response.data);
      
      if (response.data) {
        setResults({
          totalCount: response.data.totalCount || 0,
          results: response.data.results || []
        });
      } else {
        setError('No data received from the server');
      }
    } catch (err) {
      console.error('Search error:', err);
      let errorMessage = 'An error occurred while searching';
      
      if (err.response) {
        // Server responded with an error
        console.error('Error response:', err.response);
        errorMessage = err.response.data?.error || err.response.data || err.message;
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'No response received from the server';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-container">
      <h2 className="search-title">Bug Search</h2>
      
      <div className="search-input-group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter search terms..."
          className="search-bar"
          disabled={loading}
        />
        <button 
          onClick={handleSearch} 
          className="search-button"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <i className="error-icon">⚠️</i>
          {error}
        </div>
      )}

      {loading && (
        <div className="loading-message">
          Searching for results...
        </div>
      )}

      {results && !error && (
        <div className="results-container">
          <h3 className="results-header">
            Search Results {results.totalCount > 0 && `(${results.totalCount} found)`}
          </h3>
          
          {results.results.length > 0 ? (
            <ul className="results-list">
              {results.results.map((item, index) => (
                <li key={index} className="result-item">
                  {item.bugID && (
                    <div className="result-field">
                      <strong>Bug ID:</strong> {item.bugID}
                    </div>
                  )}
                  {item.submissionID && (
                    <div className="result-field">
                      <strong>Submission ID:</strong> {item.submissionID}
                    </div>
                  )}
                  {item.requirementNoFull && (
                    <div className="result-field">
                      <strong>Requirement:</strong> {item.requirementNoFull}
                    </div>
                  )}
                  {item.bugType && (
                    <div className="result-field">
                      <strong>Bug Type:</strong> {item.bugType}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-results">No results found for your search</p>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;