
const GEMINI_API_KEY = 'AIzaSyBBFw76JNYRSIqCeWm7Ho9RSLGxu3MFB1M';
const UNSPLASH_API_KEY = 'j9MJBf7t2eWfCg647RDX7ln3DMPODRrCPkxEg21qLu8';
const OPENWEATHER_API_KEY = '230942273341be46649f863c933efcb6';

/*******************************
  DEFAULT HOBBIES
*******************************/
const defaultHobbies = [
    {
        name: 'Photography',
        category: 'creative',
        description: 'Capture moments through your lens.',
        difficulty: 'Medium',
        wiki: 'https://en.wikipedia.org/wiki/Photography',
        equipment: 'Camera, lens, tripod',
        tutorials: 'Online photography courses',
        classes: 'Local photography workshops'
      },
      {
        name: 'Hiking',
        category: 'physical',
        description: 'Explore scenic trails and nature paths.',
        difficulty: 'Easy',
        wiki: 'https://en.wikipedia.org/wiki/Hiking',
        equipment: 'Hiking boots, water, map',
        tutorials: 'Hiking tips online',
        classes: 'Local hiking clubs'
      },
      {
        name: 'Chess',
        category: 'intellectual',
        description: 'Challenge your mind with strategic gameplay.',
        difficulty: 'Medium',
        wiki: 'https://en.wikipedia.org/wiki/Chess',
        equipment: 'Chess board, pieces',
        tutorials: 'Online chess lessons',
        classes: 'Local chess clubs'
      },
      {
        name: 'Cooking',
        category: 'creative',
        description: 'Experiment with recipes and flavors.',
        difficulty: 'Easy',
        wiki: 'https://en.wikipedia.org/wiki/Cooking',
        equipment: 'Basic kitchen utensils',
        tutorials: 'Cooking tutorials online',
        classes: 'Local cooking classes'
      },
      {
        name: 'Dancing',
        category: 'social',
        description: 'Express yourself through movement and rhythm.',
        difficulty: 'Medium',
        wiki: 'https://en.wikipedia.org/wiki/Dance',
        equipment: 'Comfortable clothes, shoes',
        tutorials: 'Online dance lessons',
        classes: 'Local dance studios'
      },
      {
        name: 'Yoga',
        category: 'physical',
        description: 'Enhance your flexibility and mindfulness.',
        difficulty: 'Easy',
        wiki: 'https://en.wikipedia.org/wiki/Yoga',
        equipment: 'Yoga mat, comfortable clothes',
        tutorials: 'Online yoga classes',
        classes: 'Local yoga centers'
      },
      {
        name: 'Painting',
        category: 'creative',
        description: 'Bring colors to life on canvas.',
        difficulty: 'Medium',
        wiki: 'https://en.wikipedia.org/wiki/Painting',
        equipment: 'Paints, brushes, canvas',
        tutorials: 'Online painting tutorials',
        classes: 'Local art classes'
      }
];


// Local storage functions storage functions
function saveHobbiesToStorage(hobbies) {
    localStorage.setItem('savedHobbies', JSON.stringify(hobbies));
}
function getHobbiesFromStorage() {
    const saved = localStorage.getItem('savedHobbies');
    return saved ? JSON.parse(saved) : defaultHobbies;
}

/*******************************
  DOM ELEMENTS
*******************************/

const elements = {
    themeButton: document.getElementById('themeButton'),
    findHobbiesBtn: document.getElementById('findHobbies'),
    hobbyGrid: document.getElementById('hobbyGrid'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    modal: document.getElementById('hobbyModal'),
    currentLocation: document.getElementById('currentLocation'),
    weatherWidget: document.getElementById('weatherWidget'),
    weatherSuggestions: document.getElementById('weatherSuggestions'),
    refreshWeather: document.getElementById('refreshWeather'),
    refreshLocation: document.getElementById('refreshLocation'),
};

/*******************************
  THEME MANAGEMENT
*******************************/
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = elements.themeButton.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

/*******************************
  WEATHER & LOCATION SERVICES
*******************************/
async function getUserLocation() {
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        return {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
    } catch (error) {
        console.error('Location error:', error);
        return null;
    }
}

async function updateLocation() {
    elements.currentLocation.textContent = 'Updating location...';
    const location = await getUserLocation();
    if (location) {
        const locationName = await reverseGeocode(location.latitude, location.longitude);
        elements.currentLocation.textContent = locationName;
        updateWeather(location);
        updateMap(location);
    } else {
        elements.currentLocation.textContent = 'Location unavailable';
    }
}

async function reverseGeocode(lat, lon) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        );
        const data = await response.json();
        return data.address.city || data.address.town || 'Unknown location';
    } catch (error) {
        console.error('Geocoding error:', error);
        return 'Unknown location';
    }
}

async function updateWeather(location) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );
        const data = await response.json();
        displayWeather(data);
        updateWeatherSuggestions(data);
    } catch (error) {
        console.error('Weather error:', error);
        elements.weatherWidget.innerHTML = '<p>Weather data unavailable</p>';
    }
}

function displayWeather(data) {
    const { temp } = data.main;
    const { description, icon } = data.weather[0];
    elements.weatherWidget.innerHTML = `
        <div class="weather-display">
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
            <div class="weather-info">
                <h3>${Math.round(temp)}°C</h3>
                <p>${description.charAt(0).toUpperCase() + description.slice(1)}</p>
            </div>
        </div>
    `;
}

function updateWeatherSuggestions(weatherData) {
    const condition = weatherData.weather[0].main.toLowerCase();
    const temp = weatherData.main.temp;
    
    let suggestions = [];
    
    // Weather-based hobby suggestions
    // this are simply suggestions based on temperature range
    // thsi does not take in api data

    if (temp > 20 && ['clear', 'clouds'].includes(condition)) {
        suggestions.push(
            { name: 'Outdoor Photography', icon: 'camera' },
            { name: 'Hiking', icon: 'hiking' },
            { name: 'Garden', icon: 'leaf' }
        );
    } else if (condition === 'rain' || condition === 'snow') {
        suggestions.push(
            { name: 'Indoor Painting', icon: 'paint-brush' },
            { name: 'Reading', icon: 'book' },
            { name: 'Cooking', icon: 'utensils' }
        );
    } else {
        suggestions.push(
            { name: 'Mixed Activities', icon: 'random' },
            { name: 'Flexible Hobbies', icon: 'puzzle-piece' }
        );
    }

    elements.weatherSuggestions.innerHTML = suggestions.map(suggestion => `
        <div class="suggestion-item">
            <i class="fas fa-${suggestion.icon}"></i>
            <span>${suggestion.name}</span>
        </div>
    `).join('');
}

/*******************************
        POPULAR HOBBIES
 ******************************/

        elements.popularHobbiesToggle = document.getElementById('popularHobbiesToggle');
elements.popularHobbiesContent = document.getElementById('popularHobbiesContent');

// Add this function to display popular hobbies
function displayPopularHobbies() {
    const popularHobbiesGrid = document.querySelector('.popular-hobbies-grid');
    popularHobbiesGrid.innerHTML = defaultHobbies.map(hobby => `
        <div class="popular-hobby-card" data-category="${hobby.category}">
            <h3>${hobby.name}</h3>
            <div class="category">
                <i class="fas fa-tag"></i> ${hobby.category.charAt(0).toUpperCase() + hobby.category.slice(1)}
            </div>
            <p class="description">${hobby.description}</p>
        </div>
    `).join('');

    // Add click event to each card
    document.querySelectorAll('.popular-hobby-card').forEach((card, index) => {
        card.addEventListener('click', () => showHobbyDetails(defaultHobbies[index]));
    });
}

// Add this to handle the toggle functionality
function initializePopularHobbies() {
    elements.popularHobbiesToggle.addEventListener('click', () => {
        elements.popularHobbiesToggle.classList.toggle('active');
        elements.popularHobbiesContent.classList.toggle('active');
    });
    displayPopularHobbies();
}

/*******************************
  HOBBY MANAGEMENT & UI
*******************************/
async function getHobbyImage(hobbyName) {
    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(hobbyName)}&per_page=1`,
            {
                headers: {
                    'Authorization': `Client-ID ${UNSPLASH_API_KEY}`
                }
            }
        );
        const data = await response.json();
        return data.results?.[0]?.urls?.regular || 'default-image.jpg';
    } catch (error) {
        console.error('Image fetch error:', error);
        return 'default-image.jpg';
    }
}

// async function getHobbySuggestions(preferences)
async function getHobbySuggestions(preferences) {
    const prompt = `Suggest 8 hobbies based on these preferences:
        Time available: ${preferences.duration}
        Energy level: ${preferences.energy}
        Social preference: ${preferences.social}
        For each hobby, provide:
        Name | Category | Description | Difficulty | Equipment Needed
        Format as pipe-separated values. No extra text.`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );
        const data = await response.json();
        const parsedHobbies = parseGeminiResponse(data);
        saveHobbiesToStorage(parsedHobbies); // Save to local storage
        return parsedHobbies;
    } catch (error) {
        console.error('Gemini API error:', error);
        return getHobbiesFromStorage(); // Return saved hobbies if API fails
    }
}

function parseGeminiResponse(data) {
    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return defaultHobbies;
    }
    
    const text = data.candidates[0].content.parts[0].text;
    return text.split('\n')
        .filter(line => line.trim())
        .map(line => {
            const [name, category, description, difficulty, equipment] = 
                line.split('|').map(s => s.trim());
            return { name, category: category.toLowerCase(), description, difficulty, equipment };
        });
}

async function displayHobbies(hobbies) {
    elements.hobbyGrid.innerHTML = '';
    for (const hobby of hobbies) {
        const image = await getHobbyImage(hobby.name);
        const card = createHobbyCard(hobby, image);
        elements.hobbyGrid.appendChild(card);
        // Add fade-in animation
        setTimeout(() => card.classList.add('visible'), 100);
    }
}

function createHobbyCard(hobby, image) {
    const card = document.createElement('div');
    card.className = 'hobby-card glass-effect';
    card.setAttribute('data-category', hobby.category);
    
    card.innerHTML = `
        <img src="${image}" alt="${hobby.name}" class="hobby-image">
        <div class="hobby-content">
            <h3>${hobby.name}</h3>
            <p>${hobby.description}</p>
            <div class="hobby-tags">
                <span class="difficulty-tag">${hobby.difficulty}</span>
                <span class="category-tag">${hobby.category}</span>
            </div>
        </div>
    `;

    card.addEventListener('click', () => showHobbyDetails(hobby, image));
    return card;
}

function showHobbyDetails(hobby, image) {
    const modalContent = elements.modal.querySelector('.modal-body');
    modalContent.innerHTML = `
        <div class="hobby-detail">
            <img src="${image}" alt="${hobby.name}" class="detail-image">
            <div class="detail-content">
                <div>
                    <h2>${hobby.name}</h2>
                    <div class="tags">
                        <span class="tag difficulty">
                            <i class="fas fa-signal"></i> ${hobby.difficulty}
                        </span>
                        <span class="tag category">
                            <i class="fas fa-tag"></i> ${hobby.category}
                        </span>
                    </div>
                </div>
                
                <div class="description">
                    <p>${hobby.description}</p>
                </div>

                <div class="equipment">
                    <h3><i class="fas fa-tools"></i> Equipment Needed</h3>
                    <p>${hobby.equipment}</p>
                </div>

                <div class="getting-started">
                    <h3><i class="fas fa-flag"></i> Getting Started</h3>
                    <ul>
                        <li>Research basic techniques and tutorials online</li>
                        <li>Join local groups or classes in your area</li>
                        <li>Start with basic equipment and gradually upgrade</li>
                    </ul>
                </div>

                <div class="links">
                    <h3><i class="fas fa-link"></i> Useful Links</h3>
                    <a href="https://en.wikipedia.org/wiki/${hobby.name.replace(' ', '_')}" 
                       target="_blank" 
                       class="wiki-link">
                        <i class="fab fa-wikipedia-w"></i> Learn more on Wikipedia
                    </a>
                </div>
            </div>
        </div>
    `;
    elements.modal.style.display = 'block';
}

function filterHobbies(category) {
    const currentHobbies = getHobbiesFromStorage(); 
    const filteredHobbies = category === 'all' 
        ? currentHobbies 
        : currentHobbies.filter(hobby => hobby.category.toLowerCase() === category.toLowerCase());
    
    displayHobbies(filteredHobbies);
}

function initializeCategoryFilters() {
    document.querySelectorAll('.pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            filterHobbies(pill.dataset.category);
        });
    });
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
    `;
    document.querySelector('.container').prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// /*******************************
//   EVENT LISTENERS
// *******************************/
function initializeEventListeners() {
    // Theme toggle
    elements.themeButton.addEventListener('click', toggleTheme);

    // Find hobbies button
    elements.findHobbiesBtn.addEventListener('click', async () => {
        const preferences = {
            duration: document.getElementById('duration').value,
            energy: document.getElementById('energy').value,
            social: document.getElementById('social').value
        };

        if (!preferences.duration || !preferences.energy || !preferences.social) {
            showError('Please select all preferences.');
            return;
        }

        elements.loadingOverlay.style.display = 'flex';
        const suggestions = await getHobbySuggestions(preferences);
        await displayHobbies(suggestions);
        elements.loadingOverlay.style.display = 'none';
    });

    // Category filtering
    document.querySelectorAll('.pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelector('.pill.active')?.classList.remove('active');
            pill.classList.add('active');
            filterHobbies(pill.dataset.category);
        });
    });

    // Location refresh
    elements.refreshLocation.addEventListener('click', updateLocation);

    // Modal close
    window.onclick = (event) => {
        if (event.target === elements.modal) {
            elements.modal.style.display = 'none';
        }
    };
    document.querySelector('.close-button').onclick = () => {
        elements.modal.style.display = 'none';
    };
}

// /*******************************
//   INITIALIZATION
// *******************************/


document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    
    // Initialize all event listeners
    elements.themeButton.addEventListener('click', toggleTheme);
    
    elements.findHobbiesBtn.addEventListener('click', async () => {
        const preferences = {
            duration: document.getElementById('duration').value,
            energy: document.getElementById('energy').value,
            social: document.getElementById('social').value
        };

        if (!preferences.duration || !preferences.energy || !preferences.social) {
            showError('Please select all preferences.');
            return;
        }
        

        elements.loadingOverlay.style.display = 'flex';
        const suggestions = await getHobbySuggestions(preferences);
        await displayHobbies(suggestions);
        
        // Reset category pills to 'all'
        document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        document.querySelector('.pill[data-category="all"]').classList.add('active');
        
        elements.loadingOverlay.style.display = 'none';
    });

    // Initialize popular hobbies
    initializePopularHobbies();

    // Initialize category filters
    initializeCategoryFilters();

    // Initialize modal close handlers
    window.onclick = (event) => {
        if (event.target === elements.modal) {
            elements.modal.style.display = 'none';
        }
    };
    document.querySelector('.close-button').onclick = () => {
        elements.modal.style.display = 'none';
    };

    // Initialize location and display hobbies
    await updateLocation();
    const savedHobbies = getHobbiesFromStorage();
    await displayHobbies(savedHobbies);
});


// Update the weather refresh event listener
elements.refreshWeather.addEventListener('click', async () => {
    const refreshIcon = elements.refreshWeather.querySelector('i');
    refreshIcon.classList.add('refreshing');
    
    elements.weatherWidget.innerHTML += `
        <div class="weather-updating">
            <div class="loader"></div>
        </div>
    `;

    const location = await getUserLocation();
    if (location) {
        await updateWeather(location);
    }

    refreshIcon.classList.remove('refreshing');
    const updatingDiv = document.querySelector('.weather-updating');
    if (updatingDiv) updatingDiv.remove();
});
