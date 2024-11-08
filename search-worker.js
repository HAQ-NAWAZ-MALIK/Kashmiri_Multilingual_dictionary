// search-worker.js
let dictionaryData = [];

// Function to perform search based on criteria
function performSearch(searchParams) {
    const {
        searchTerm,
        searchField,
        searchMode,
        page,
        resultsPerPage
    } = searchParams;

    if (!searchTerm) {
        return paginateResults(dictionaryData, page, resultsPerPage);
    }

    const searchTermLower = searchTerm.toLowerCase();

    const filteredData = dictionaryData.filter(entry => {
        let fieldValue;

        if (searchField === 'all') {
            // Search across all fields
            return Object.values(entry).some(value => 
                value && matchValue(String(value).toLowerCase(), searchTermLower, searchMode)
            );
        } else {
            fieldValue = entry[searchField];
            return fieldValue && matchValue(String(fieldValue).toLowerCase(), searchTermLower, searchMode);
        }
    });

    return paginateResults(filteredData, page, resultsPerPage);
}

// Helper function to match values based on search mode
function matchValue(value, searchTerm, mode) {
    switch (mode) {
        case 'startsWith':
            return value.startsWith(searchTerm);
        case 'exact':
            return value === searchTerm;
        case 'contains':
        default:
            return value.includes(searchTerm);
    }
}

// Function to paginate results
function paginateResults(data, page, resultsPerPage) {
    const startIndex = (page - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    
    return {
        totalResults: data.length,
        currentPage: page,
        totalPages: Math.ceil(data.length / resultsPerPage),
        results: data.slice(startIndex, endIndex)
    };
}

// Message handler
self.onmessage = function(e) {
    const { type, data } = e.data;

    switch (type) {
        case 'init':
            dictionaryData = data;
            self.postMessage({ type: 'initialized' });
            break;

        case 'search':
            const results = performSearch(data);
            self.postMessage({ 
                type: 'searchResults',
                data: results
            });
            break;

        default:
            console.error('Unknown message type:', type);
    }
};
