let data = {}; // Для зберігання даних із JSON
let currentFile = 'js/sample.json'; // Поточний файл
let currentImageIndex = 0;
let currentImages = [];

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
function changeFile() {
    // Очищення стовпчиків
    document.getElementById('brands').innerHTML = ''; // Очищення списку брендів
    document.getElementById('models').innerHTML = ''; // Очищення списку моделей
    document.getElementById('years').innerHTML = ''; // Очищення списку років
    document.getElementById('gallery').innerHTML = ''; // Очищення галереї

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
        li.addEventListener('click', (event) => handleBrandSelection(brand, event));
        brandsList.appendChild(li);
    });
}

// Оновлена функція для вибору бренду
function handleBrandSelection(selectedBrand, event) {
    // Знімаємо активний клас з усіх брендів
    const brandsList = document.getElementById('brands');
    Array.from(brandsList.children).forEach((li) => li.classList.remove('active'));

    // Додаємо активний клас до вибраного бренду
    event.target.classList.add('active');

    // Отримуємо моделі для вибраного бренду
    const models = new Set();
    Object.keys(data).forEach((key) => {
        const [brand, model] = key.split('/');
        if (brand === selectedBrand) {
            models.add(model);
        }
    });

    // Заповнюємо список моделей
    const modelsList = document.getElementById('models');
    modelsList.innerHTML = '';
    models.forEach((model) => {
        const li = document.createElement('li');
        li.textContent = model;
        li.addEventListener('click', (event) => handleModelSelection(selectedBrand, model, event));
        modelsList.appendChild(li);
    });

    // Очищаємо роки та галерею
    document.getElementById('years').innerHTML = '';
    document.getElementById('gallery').innerHTML = '';

    // Оновлюємо текст вибору
    updateSelectionDisplay(selectedBrand, null, null);
}

// Оновлена функція для вибору моделі
function handleModelSelection(selectedBrand, selectedModel, event) {
    // Знімаємо активний клас з усіх моделей
    const modelsList = document.getElementById('models');
    Array.from(modelsList.children).forEach((li) => li.classList.remove('active'));

    // Додаємо активний клас до вибраної моделі
    event.target.classList.add('active');

    // Отримуємо роки для вибраного бренду та моделі
    const years = new Set();
    Object.keys(data).forEach((key) => {
        const [brand, model, year] = key.split('/');
        if (brand === selectedBrand && model === selectedModel) {
            years.add(year);
        }
    });

    // Заповнюємо список років
    populateYears(selectedBrand, selectedModel, Array.from(years).sort());

    // Очищаємо галерею
    document.getElementById('gallery').innerHTML = '';

    // Оновлюємо текст вибору
    updateSelectionDisplay(selectedBrand, selectedModel, null);
}

// Оновлена функція для вибору року
function handleYearSelection(selectedBrand, selectedModel, selectedYear, event) {
    // Знімаємо активний клас з усіх років
    const yearsList = document.getElementById('years');
    Array.from(yearsList.children).forEach((li) => li.classList.remove('active'));

    // Додаємо активний клас до вибраного року
    event.target.classList.add('active');

    // Оновлюємо текст вибору
    updateSelectionDisplay(selectedBrand, selectedModel, selectedYear);

    // Очищаємо галерею
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';

    // Додаємо зображення до галереї
    currentImages = [];
    Object.entries(data).forEach(([key, url]) => {
        const [brand, model, year] = key.split('/');
        if (brand === selectedBrand && model === selectedModel && year === selectedYear) {
            currentImages.push(url);
        }
    });

    currentImages.forEach((src) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Car Image';
        img.classList.add('gallery-image');
        img.addEventListener('click', () => openModal(src));
        gallery.appendChild(img);
    });

    cleanGallery();
}

// Очищення основної галереї від фото 1x1 і тих, що не завантажилися
function cleanGallery() {
    const gallery = document.getElementById('gallery');
    const images = gallery.querySelectorAll('img');

    images.forEach((img) => {
        img.addEventListener('error', () => {
            img.remove(); // Видаляємо, якщо зображення не завантажилося
        });

        img.addEventListener('load', () => {
            if (img.naturalWidth === 1 && img.naturalHeight === 1) {
                img.remove(); // Видаляємо, якщо розмір 1x1
            }
        });
    });
}

// Оновлена функція для створення модальної галереї
function createModalGallery() {
    const modal = document.getElementById('modal');
    const modalImage = document.getElementById('modalImage');
    const thumbnailRow = document.getElementById('thumbnailRow');

    // Очищення попередньої модальної галереї
    thumbnailRow.innerHTML = '';

    // Створення модальної галереї на основі очищеної основної галереї
    const galleryImages = document.querySelectorAll('#gallery img');
    galleryImages.forEach((img, index) => {
        const thumbnail = document.createElement('img');
        thumbnail.src = img.src;
        thumbnail.alt = `Thumbnail ${index + 1}`;
        thumbnail.classList.add('thumbnail');

        // Додавання обробника для вибору фото
        thumbnail.addEventListener('click', () => {
            modalImage.src = img.src;
            currentImageIndex = index; // Оновлюємо індекс
            updateThumbnails();
        });

        thumbnailRow.appendChild(thumbnail);
    });

    // Підсвічуємо початкову мініатюру
    updateThumbnails();

    // Відкриття модального вікна
    modal.style.display = 'flex';
}

function updateThumbnails() {
    const thumbnails = document.querySelectorAll('.thumbnail-row img');
    thumbnails.forEach((thumb, index) => {
        thumb.classList.remove('active');
        if (index === currentImageIndex) {
            thumb.classList.add('active');
        }
    });
}

// Оновлена функція для відкриття модального вікна
function openModal(src) {
    const modalImage = document.getElementById('modalImage');
    modalImage.src = src;

    // Створення модальної галереї
    createModalGallery();

    // Додаємо клас для блокування прокручування
    document.body.classList.add('modal-open');
}

// Функція для гортання фото
function changeImage(direction) {
    currentImageIndex += direction;
    if (currentImageIndex < 0) {
        currentImageIndex = currentImages.length - 1;
    } else if (currentImageIndex >= currentImages.length) {
        currentImageIndex = 0;
    }
    const modalImage = document.getElementById('modalImage');
    modalImage.src = currentImages[currentImageIndex];

    // Оновлення підсвічування мініатюр
    updateThumbnails();
}

// Оновлена функція для закриття модального вікна
document.querySelector('.close').addEventListener('click', () => {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';

    // Видаляємо клас для розблокування прокручування
    document.body.classList.remove('modal-open');
});

// Додавання обробників для стрілочок
document.querySelector('.prev').addEventListener('click', () => changeImage(-1));
document.querySelector('.next').addEventListener('click', () => changeImage(1));

// Додавання обробника для клавіатури
window.addEventListener('keydown', (event) => {
    if (document.getElementById('modal').style.display === 'flex') {
        if (event.key === 'ArrowLeft') {
            changeImage(-1); // Гортання назад
        } else if (event.key === 'ArrowRight') {
            changeImage(1); // Гортання вперед
        }
    }
});

// Додавання обробника для колесика миші
document.getElementById('modal').addEventListener('wheel', (event) => {
    if (event.deltaY < 0) {
        changeImage(1); // Гортання вперед (колесико вгору)
    } else if (event.deltaY > 0) {
        changeImage(-1); // Гортання назад (колесико вниз)
    }
});

// Закриття модального вікна при кліку поза зображенням
window.addEventListener('click', (event) => {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';

        // Видаляємо клас для розблокування прокручування
        document.body.classList.remove('modal-open');
    }
});

// Ініціалізація
document.addEventListener('DOMContentLoaded', () => {
    // ... (інший код)

    // Замінюємо випадаючий список кнопками
    const fileSelectorContainer = document.getElementById('fileSelectorContainer');
    const buttons = fileSelectorContainer.querySelectorAll('button');

    // Встановлюємо "Sample JSON" як активний при завантаженні
    buttons.forEach(button => {
        if (button.dataset.file === 'js/sample.json') {
            button.classList.add('active');
            currentFile = button.dataset.file;
        }
    });

    fileSelectorContainer.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            currentFile = event.target.dataset.file;
            changeFile(); // Викликаємо функцію зміни файлу

            // Додаємо активний клас до вибраної кнопки
            buttons.forEach(button => button.classList.remove('active'));
            event.target.classList.add('active');
        }
    });

    fetchData(); // Завантажуємо дані при завантаженні сторінки
});

document.addEventListener("DOMContentLoaded", () => {
    const thumbnails = document.querySelectorAll(".thumbnail-row img");

    thumbnails.forEach((img) => {
        // Додаємо атрибут, щоб відстежувати, чи зображення вже оброблено
        if (!img.dataset.processed) {
            img.dataset.processed = "true"; // Позначаємо зображення як оброблене

            img.addEventListener("error", () => {
                img.remove(); // Видаляємо, якщо зображення не завантажилося
            });

            img.addEventListener("load", () => {
                if (img.naturalWidth === 1 && img.naturalHeight === 1) {
                    img.remove(); // Видаляємо, якщо розмір 1x1
                }
            });
        }
    });
});

function updateSelectionDisplay(brand, model, year) {
    const selectionDisplay = document.getElementById('selectionDisplay');
    if (brand && model && year) {
        selectionDisplay.textContent = `${brand} ${model} ${year}`;
    } else if (brand && model) {
        selectionDisplay.textContent = `${brand} ${model}`;
    } else if (brand) {
        selectionDisplay.textContent = `${brand}`;
    } else {
        selectionDisplay.textContent = 'No selection';
    }
}

function populateYears(selectedBrand, selectedModel, years) {
    const yearsList = document.getElementById('years');
    yearsList.innerHTML = ''; // Очищення списку років

    years.forEach((year, index) => {
        const li = document.createElement('li');
        li.textContent = year;
        li.id = `year-${index}`; // Додаємо унікальний id
        li.classList.add('year-button'); // Додаємо клас для стилізації
        li.addEventListener('click', (event) => handleYearSelection(selectedBrand, selectedModel, year, event));
        yearsList.appendChild(li);
    });
}