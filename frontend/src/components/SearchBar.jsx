import { useState } from 'react';          // Import the useState hook for component state management
import axios from 'axios';                 // Import axios for making HTTP requests
import './SearchBar.css';                  // Import CSS styles for this component

function SearchBar() {
  // Define state variables:
  const [query, setQuery] = useState('');      // Holds the search text entered by the user
  const [results, setResults] = useState(null);  // Holds the search results returned from the API
  const [loading, setLoading] = useState(false); // Indicates if a search is in progress
  const [error, setError] = useState(null);      // Holds error messages if any occur

  // Function to handle search requests when user clicks button or presses 'Enter'
  const handleSearch = async () => {
    // If there's no query text, update error state and exit
    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }

    // Set the loading state to true and clear previous errors & results
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      // Log the API endpoint and query for debugging purposes
      console.log('Sending request to:', `/api/SearchFunction?query=${encodeURIComponent(query)}`);
      
      // Make a GET request to the backend search API with the query
      // The request URL is built using the query value (safely encoded)
      const response = await axios.get(`/api/SearchFunction?query=${encodeURIComponent(query)}`, {
        headers: {
          'Accept': 'application/json',         // Expect JSON response
          'Content-Type': 'application/json'      // Sending JSON content
        }
      });

      console.log('Search response:', response.data);
      
      // If data exists in the response, construct the results object
      if (response.data) {
        setResults({
          totalCount: response.data.totalCount || 0, // Total number of matching items
          results: response.data.results || []       // The list of simplified search results
        });
      } else {
        // If no data is returned, set an error message
        setError('No data received from the server');
      }
    } catch (err) {
      // Log details of the error if the request fails
      console.error('Search error:', err);
      let errorMessage = 'An error occurred while searching';
      
      // If the server responded with an error, check for error details
      if (err.response) {
        console.error('Error response:', err.response);
        errorMessage = err.response.data?.error || err.response.data || err.message;
      } else if (err.request) {
        // No response was received
        errorMessage = 'No response received from the server';
      }
      
      // Update the error state so the user can see the message
      setError(errorMessage);
    } finally {
      // Whether success or error, stop the loading indicator
      setLoading(false);
    }
  };

  // This handler allows the user to trigger a search by pressing the Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // The returned JSX defines the component's UI
  return (
    <div className="search-container">
      <h2 className="search-title">Bug Search</h2>
      
      <div className="search-input-group">
        {/* Input field for search query */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}  // Update query state as user types
          onKeyPress={handleKeyPress}                   // Trigger search on Enter press
          placeholder="Enter search terms..."
          className="search-bar"
          disabled={loading}                           // Disable input while loading
        />
        {/* Search button */}
        <button 
          onClick={handleSearch} 
          className="search-button"
          disabled={loading}                          // Disable button if search is in progress
        >
          {loading ? 'Searching...' : 'Search'}        {/* Display loading indicator if necessary */}
        </button>
      </div>

      {/* Display error message if one exists */}
      {error && (
        <div className="error-message">
          <i className="error-icon">⚠️</i>
          {error}
        </div>
      )}

      {/* Display a loading message while search is executing */}
      {loading && (
        <div className="loading-message">
          Searching for results...
        </div>
      )}

      {/* Display search results if available and no error */}
      {results && !error && (
        <div className="results-container">
          <h3 className="results-header">
            Search Results {results.totalCount > 0 && `(${results.totalCount} found)`}
          </h3>
          
          {results.results.length > 0 ? (
            <ul className="results-list">
              {/* Loop through each result and display its fields */}
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
            // Inform the user if no results were found
            <p className="no-results">No results found for your search</p>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;