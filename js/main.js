// ===== SEARCH & FILTER LOGIC =====

const gameSearch = document.getElementById('gameSearch');
const filterBtns = document.querySelectorAll('.filter-btn');
const noResults = document.getElementById('noResults');

function filterGames() {
    const searchTerm = gameSearch.value.toLowerCase();
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
    const gameCards = document.querySelectorAll('.game-card'); 
    let visibleCount = 0;

    gameCards.forEach(card => {
        const gameName = card.querySelector('.game-name').textContent.toLowerCase();
        const gameCategory = card.dataset.category || 'all';

        // Check if it matches Search AND Filter
        const matchesSearch = gameName.includes(searchTerm);
        const matchesFilter = (activeFilter === 'all' || gameCategory === activeFilter);

        if (matchesSearch && matchesFilter) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });

    if (visibleCount === 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
    }
}

gameSearch.addEventListener('input', filterGames);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        filterGames();
    });
});

window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== gameSearch) {
        e.preventDefault(); // Prevent the '/' from being typed
        gameSearch.focus();
    }
});
