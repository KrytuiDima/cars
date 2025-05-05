let data = {}; // Для зберігання даних із JSON
let currentFile = 'js/sample.json'; // Поточний файл

// Завантаження даних із JSON
async function fetchData() {
    try {
        const response = await fetch(currentFile); // Використовуємо поточний файл
        data = await response.json();
        populateBrands(); // Заповнення списку брендів
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Зміна файлу через випадаючий список
function changeFile(event) {
    currentFile = event.target.value; // Отримуємо вибраний файл
    fetchData(); // Перезавантаження даних
}

// Заповнення списку брендів
function populateBrands() {
    const brands = new Set();
    Object.keys(data).forEach(key => {
        const brand = key.split('/')[0];
        brands.add(brand);
    });

    const brandsList = document.getElementById('brands');
    brandsList.innerHTML = '';
    brands.forEach(brand => {
        const li = document.createElement('li');
        li.textContent = brand;
        li.addEventListener('click', () => handleBrandSelection(brand));
        brandsList.appendChild(li);
    });
}

// Обробка вибору бренду
function handleBrandSelection(selectedBrand) {
    const models = new Set();
    Object.keys(data).forEach(key => {
        const [brand, model] = key.split('/');
        if (brand === selectedBrand) {
            models.add(model);
        }
    });

    const modelsList = document.getElementById('models');
    modelsList.innerHTML = '';
    models.forEach(model => {
        const li = document.createElement('li');
        li.textContent = model;
        li.addEventListener('click', () => handleModelSelection(selectedBrand, model));
        modelsList.appendChild(li);
    });

    document.getElementById('years').innerHTML = ''; // Очищення списку років
    document.getElementById('gallery').innerHTML = ''; // Очищення галереї
}

// Обробка вибору моделі
function handleModelSelection(selectedBrand, selectedModel) {
    const years = new Set();
    Object.keys(data).forEach(key => {
        const [brand, model, year] = key.split('/');
        if (brand === selectedBrand && model === selectedModel) {
            years.add(year);
        }
    });

    const yearsList = document.getElementById('years');
    yearsList.innerHTML = '';
    years.forEach(year => {
        const li = document.createElement('li');
        li.textContent = year;
        li.addEventListener('click', () => handleYearSelection(selectedBrand, selectedModel, year));
        yearsList.appendChild(li);
    });

    document.getElementById('gallery').innerHTML = ''; // Очищення галереї
}

// Обробка вибору року
function handleYearSelection(selectedBrand, selectedModel, selectedYear) {
    const images = [];
    Object.entries(data).forEach(([key, url]) => {
        const [brand, model, year] = key.split('/');
        if (brand === selectedBrand && model === selectedModel && year === selectedYear) {
            images.push(url);
        }
    });

    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';
    images.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Car Image';
        img.classList.add('gallery-image');

        // Видалення зображень, які не завантажились
        img.onerror = () => img.remove();

        gallery.appendChild(img);
    });
}

// Ініціалізація
document.addEventListener('DOMContentLoaded', () => {
    fetchData();

    // Додаємо випадаючий список для вибору файлу
    const fileSelector = document.createElement('select');
    fileSelector.id = 'fileSelector';

    // Додаємо опції до випадаючого списку
    const files = [
        { name: 'Sample JSON', value: 'js/sample.json' },
        { name: 'Image Sources JSON', value: 'js/image_sources.json' }
    ];

    files.forEach(file => {
        const option = document.createElement('option');
        option.value = file.value;
        option.textContent = file.name;
        fileSelector.appendChild(option);
    });

    // Додаємо обробник подій для зміни файлу
    fileSelector.addEventListener('change', changeFile);

    // Додаємо випадаючий список до сторінки
    document.body.insertBefore(fileSelector, document.body.firstChild);
});