// Selecting DOM elements
let searchInput = document.querySelector('#searchInput');
let clearSearch = document.querySelector('#clearSearch');
let resultsContainer = document.querySelector('#results');
let loading = document.querySelector('#loading');
let errorMsg = document.querySelector('#error');

// Modal Elements
let modal = document.querySelector('#modal');
let modalImage = document.querySelector('#modalImage');
let modalTitle = document.querySelector('#modalTitle');
let modalRating = document.querySelector('#modalRating');
let modalGenres = document.querySelector('#modalGenres');
let modalPremiered = document.querySelector('#modalPremiered');
let modalSummary = document.querySelector('#modalSummary');
let modalLink = document.querySelector('#modalLink');
let closeModal = document.querySelector('#closeModal');

let debounceTimer;

/**
 * Show/Hide Clear Button on Input Change
 * If the user types in the search bar, show the "X" button to clear input.
 */
searchInput.addEventListener('input', function () {
    if (searchInput.value.trim()) {
        clearSearch.classList.remove('hidden');
    } else {
        clearSearch.classList.add('hidden');
    }
    
    // Debounce API call to reduce unnecessary requests
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        let searchTerm = searchInput.value.trim();
        if (!searchTerm) {
            resultsContainer.innerHTML = ''; // Clear if empty search
            return;
        }
        fetchShows(searchTerm);
    }, 500); // 500ms delay
});

/**
 * Clear Search Input and Results
 * When the "X" button is clicked, clear the search input and results.
 */
clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    clearSearch.classList.add('hidden');
    resultsContainer.innerHTML = ''; // Clear results when search is cleared
});

/**
 * Fetch TV Shows from API
 * @param {string} searchTerm - The search query entered by the user.
 */
async function fetchShows(searchTerm) {
    resultsContainer.innerHTML = ''; // Clear previous results
    errorMsg.classList.add('hidden');
    loading.classList.remove('hidden'); // Show loading indicator

    try {
        let config = { params: { q: searchTerm } };
        let res = await axios.get(`https://api.tvmaze.com/search/shows`, config);
        loading.classList.add('hidden'); // Hide loading

        if (res.data.length === 0) {
            errorMsg.classList.remove('hidden'); // Show error if no results
        } else {
            displayResults(res.data);
        }
    } catch (err) {
        console.error(err);
        loading.classList.add('hidden');
        errorMsg.textContent = "Something went wrong!";
        errorMsg.classList.remove('hidden');
    }
}

/**
 * Display TV Show Results in a Grid
 * @param {Array} shows - Array of TV show data.
 */
function displayResults(shows) {
    resultsContainer.innerHTML = ''; // Clear old results
    for (let result of shows) {
        if (result.show.image) {
            let showCard = document.createElement('div');
            showCard.classList.add('bg-[#343a40]', 'rounded-lg', 'p-3', 'shadow-lg', 'transition', 'hover:scale-105');

            showCard.innerHTML = `
                <img data-src="${result.show.image.medium}" alt="${result.show.name}" 
                    class="lazy w-full h-64 object-contain rounded-md opacity-0 transition-opacity duration-500">
                <h2 class="text-lg font-bold mt-2">${result.show.name}</h2>
                <p class="text-sm text-gray-400">⭐ ${result.show.rating.average || 'N/A'}</p>
                <button class="mt-2 bg-[#6c757d] hover:bg-[#212529] text-white px-3 py-1 rounded details-btn" 
                    data-id="${result.show.id}">
                    More Info
                </button>
            `;

            resultsContainer.appendChild(showCard);
        }
    }

    lazyLoadImages();
    addMoreInfoEvent();
}

/**
 * Lazy Load Images - Improves performance by only loading images when they appear on screen.
 */
function lazyLoadImages() {
    let observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                let img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('opacity-0'); // Fade in when loaded
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('.lazy').forEach(img => {
        observer.observe(img);
    });
}

/**
 * Add Event Listener to "More Info" Buttons to Open Modal
 */
function addMoreInfoEvent() {
    document.querySelectorAll('.details-btn').forEach(button => {
        button.addEventListener('click', async function () {
            let showId = this.dataset.id;
            let res = await axios.get(`https://api.tvmaze.com/shows/${showId}`);
            let show = res.data;

            // Populate modal with show details
            modalImage.src = show.image ? show.image.original : 'https://via.placeholder.com/300';
            modalTitle.textContent = show.name;
            modalRating.textContent = `⭐ Rating: ${show.rating.average || 'N/A'}`;
            modalGenres.textContent = `🎭 Genres: ${show.genres.join(', ') || 'N/A'}`;
            modalPremiered.textContent = `📅 Premiered: ${show.premiered || 'N/A'}`;
            modalSummary.innerHTML = show.summary || "No description available.";
            modalLink.href = show.officialSite || '#';
            modalLink.textContent = show.officialSite ? "Visit Official Site" : "";
            modalLink.classList.add("text-white");

            // Show modal
            modal.classList.remove('hidden');
        });
    });
}

// Close modal when clicking the close button or outside the modal
closeModal.addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});
