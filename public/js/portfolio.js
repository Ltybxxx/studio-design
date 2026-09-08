document.addEventListener('DOMContentLoaded', function() {
    const applyFiltersBtn = document.getElementById('applyFilters');
    const resetFiltersBtn = document.getElementById('resetFilters');
    const roomTypeSelect = document.getElementById('roomType');
    const styleSelect = document.getElementById('style');
    const portfolioGrid = document.getElementById('portfolioGrid');

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            const roomType = roomTypeSelect ? roomTypeSelect.value : '';
            const style = styleSelect ? styleSelect.value : '';

            console.log('Применены фильтры:', { roomType, style });

            const cards = portfolioGrid.querySelectorAll('.portfolio-card');
            cards.forEach(function(card) {
                const tags = card.querySelectorAll('.project-tag');
                let roomMatch = !roomType;
                let styleMatch = !style;

                tags.forEach(function(tag) {
                    const tagText = tag.textContent.toLowerCase();

                    if (roomType === 'apartment' && tagText.includes('квартира')) {
                        roomMatch = true;
                    }
                    if (roomType === 'house' && tagText.includes('дом')) {
                        roomMatch = true;
                    }
                    if (roomType === 'commercial' && tagText.includes('коммерческое')) {
                        roomMatch = true;
                    }

                    if (style === 'minimalism' && tagText.includes('минимализм')) {
                        styleMatch = true;
                    }
                    if (style === 'scandinavian' && tagText.includes('скандинавский')) {
                        styleMatch = true;
                    }
                    if (style === 'loft' && tagText.includes('лофт')) {
                        styleMatch = true;
                    }
                });

                if (roomMatch && styleMatch) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            if (roomTypeSelect) roomTypeSelect.value = '';
            if (styleSelect) styleSelect.value = '';

            const cards = portfolioGrid.querySelectorAll('.portfolio-card');
            cards.forEach(function(card) {
                card.style.display = 'block';
            });
        });
    }
});