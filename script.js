document.addEventListener('DOMContentLoaded', () => {
    // 1. Calculate & Update Time Together (Live Ticker)
    const startDate = new Date('2025-05-01T00:00:00'); // Talking stage began May 1, 2025
    
    function updateTimer() {
        const now = new Date();
        const diff = now - startDate;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const daysElement = document.getElementById('days-together');
        if (daysElement) {
            daysElement.innerHTML = `${days}d <span style="font-size: 0.8em; opacity: 0.8">${hours}h ${minutes}m ${seconds}s</span>`;
        }
    }

    updateTimer(); // Initial call
    setInterval(updateTimer, 1000); // Update every second

    // 2. Heart Burst Effect on Hover
    let lastHeart = 0;
    const hoverHandle = (e) => {
        const now = Date.now();
        if (now - lastHeart < 400) return; // Increased throttle for way fewer hearts
        
        const x = e.clientX || (e.touches && e.touches[0].clientX);
        const y = e.clientY || (e.touches && e.touches[0].clientY);
        if (x && y) {
            createHeart(x, y);
            lastHeart = now;
        }
    };

    // Function to dynamiclly load trip gallery
    function loadGallery(tripId) {
        const galleryGrid = document.querySelector('.gallery-grid');
        const photosData = window.tripPhotos || (typeof tripPhotos !== 'undefined' ? tripPhotos : null);
        if (!photosData || !photosData[tripId]) return;

        const photos = photosData[tripId];
        
        // Update Hero Banner if it exists
        const heroImg = document.querySelector('.trip-hero-banner img');
        if (heroImg && photos.length > 0) {
            heroImg.src = photos[0];
        }

        if (!galleryGrid) return;
        
        // Clear existing placeholder content
        galleryGrid.innerHTML = '';

        if (photos.length === 0) {
            galleryGrid.innerHTML = `
                <div class="empty-gallery">
                    <div class="empty-icon">📸</div>
                    <p>More memories to be added soon...</p>
                </div>
            `;
            return;
        }

        photos.forEach((photo, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            if (index % 3 === 0) item.classList.add('wide');
            item.innerHTML = `<img src="${photo}" alt="Memory ${index + 1}" loading="lazy" onclick="openLightbox('${photo}')">`;
            galleryGrid.appendChild(item);
        });
    }

    // Lightbox Logic
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <span class="lightbox-close">&times;</span>
            <span class="lightbox-nav prev">&#10094;</span>
            <img src="" alt="Expanded View">
            <span class="lightbox-nav next">&#10095;</span>
        </div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('img');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.prev');
    const nextBtn = lightbox.querySelector('.next');
    
    let currentGalleryPhotos = [];
    let currentIndex = 0;

    window.openLightbox = function(src) {
        // Find which gallery we're in
        const currentGallery = document.querySelector('.gallery-grid, .common-gallery-grid');
        if (currentGallery) {
             // Use getAttribute('src') instead of .src to match the relative path passed to openLightbox
             currentGalleryPhotos = Array.from(currentGallery.querySelectorAll('img')).map(img => img.getAttribute('src'));
             currentIndex = currentGalleryPhotos.indexOf(src);
             // Fallback if not found (just in case)
             if (currentIndex === -1) currentIndex = 0;
        } else {
            currentGalleryPhotos = [src];
            currentIndex = 0;
        }

        updateLightboxImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; 
    };

    function updateLightboxImage() {
        if (currentGalleryPhotos.length > 0) {
            lightboxImg.style.opacity = '0';
            setTimeout(() => {
                lightboxImg.src = currentGalleryPhotos[currentIndex];
                lightboxImg.style.opacity = '1';
            }, 200);
        }
    }

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + currentGalleryPhotos.length) % currentGalleryPhotos.length;
        updateLightboxImage();
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % currentGalleryPhotos.length;
        updateLightboxImage();
    });

    lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'ArrowLeft') prevBtn.click();
        if (e.key === 'ArrowRight') nextBtn.click();
        if (e.key === 'Escape') lightboxClose.click();
    });

    // Dynamicly fill background stream from 'common' or random trips
    function initBackgroundStream() {
        const streamTrack = document.querySelector('.stream-track');
        if (!streamTrack) return;

        const photosData = window.tripPhotos || (typeof tripPhotos !== 'undefined' ? tripPhotos : null);
        if (!photosData) return;

        // Collect all available photos or use 'common'
        let allPhotos = [];
        if (photosData['common'] && photosData['common'].length > 0) {
            allPhotos = photosData['common'];
        } else {
            // Fallback: collect from all trips
            Object.values(photosData).forEach(tripArr => {
                allPhotos = allPhotos.concat(tripArr);
            });
        }

        if (allPhotos.length === 0) return;

        // Shuffle slightly for variety
        allPhotos.sort(() => Math.random() - 0.5);
        
        // Take up to 12 images
        const selection = allPhotos.slice(0, 12);
        
        // Populate and duplicate for seamless scroll
        const populate = (photos) => {
            photos.forEach(src => {
                const img = document.createElement('img');
                img.src = src;
                img.alt = "";
                streamTrack.appendChild(img);
            });
        };

        streamTrack.innerHTML = '';
        populate(selection);
        populate(selection); // Duplicate
    }

    // Handle common images visualization
    function loadCommonGallery() {
        const commonGrid = document.querySelector('.common-gallery-grid');
        if (!commonGrid) return;

        const photosData = window.tripPhotos || (typeof tripPhotos !== 'undefined' ? tripPhotos : null);
        if (!photosData || !photosData['common'] || photosData['common'].length === 0) return;

        photosData['common'].forEach((photo, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            // Make some items wide for visual variety
            if (index % 5 === 0) item.classList.add('wide');
            item.innerHTML = `<img src="${photo}" alt="Everyday Memory ${index + 1}" loading="lazy" onclick="openLightbox('${photo}')">`;
            commonGrid.appendChild(item);
        });
    }

    document.addEventListener('mousemove', hoverHandle);
    document.addEventListener('touchmove', hoverHandle, { passive: true });

    // Initialize components
    const tripBody = document.querySelector('body[data-trip-id]');
    if (tripBody) {
        loadGallery(tripBody.getAttribute('data-trip-id'));
    }
    loadCommonGallery();
    // initBackgroundStream(); // Disabled per user request

    function createHeart(x, y) {
        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.className = 'heart-emoji';
        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;
        heart.style.fontSize = `${Math.random() * 20 + 20}px`;
        
        document.body.appendChild(heart);

        setTimeout(() => {
            heart.remove();
        }, 1200); // Shorter duration for cleaner screen
    }

    // 3. Dynamic Trip Counter
    const tripCards = document.querySelectorAll('.card-link');
    const tripsCounter = document.getElementById('trips-counter');
    if (tripsCounter && tripCards.length > 0) {
        tripsCounter.textContent = tripCards.length;
    }

    // 4. Scroll Reveal for Cards
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(card);
    });
});
