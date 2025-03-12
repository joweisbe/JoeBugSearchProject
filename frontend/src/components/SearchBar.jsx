import { useState } from 'react';
import axios from 'axios';
import './SearchBar.css'; // Import the CSS file

// The SearchBar component manages a query and shows search results.
function SearchBar() {
  // 'query' is the text in the search box, 'setQuery' updates it.
  const [query, setQuery] = useState('');
  // 'results' holds the response data, 'setResults' updates it.
  const [results, setResults] = useState([]);

  // handleSearch sends a GET request to the backend and updates 'results'.
  const handleSearch = async () => {
    // The query is appended to the URL as a query parameter.
    const response = await axios.get(`http://localhost:5000/search?query=${query}`);
    // Update the 'results' array with the data from the backend.
    setResults(response.data);
  };

  return (
    <div>
      {/* Input box for entering a query */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for bugs..."
        className="search-bar" // Apply the CSS class
      />
      {/* Button that triggers the search when clicked */}
      <button onClick={handleSearch} className="search-button">Search</button>

      {/* Display the search results as a list */}
      <ul>
        {results.map((item, index) => (
          <li key={index}>{JSON.stringify(item.document)}</li>
        ))}
      </ul>
    </div>
  );
}

export default SearchBar;
