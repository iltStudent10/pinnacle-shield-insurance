(function initFaqSearch() {
    var searchInput = document.getElementById('faqSearch');
    if (!searchInput) {
        return;
    }

    var items = document.querySelectorAll('.accordion-item');
    searchInput.addEventListener('input', function() {
        var searchTerm = this.value.toLowerCase().trim();

        items.forEach(function(item) {
            var text = item.textContent.toLowerCase();
            if (!searchTerm || text.indexOf(searchTerm) !== -1) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    });
})();