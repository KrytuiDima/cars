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
function changeFile(event) {
    currentFile = event.target.value; // Отримуємо вибраний файл

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
        li.addEventListener('click', () => handleBrandSelection(brand));
        brandsList.appendChild(li);
    });
}

// Оновлена функція для вибору бренду
function handleBrandSelection(selectedBrand) {
    const brandsList = document.getElementById('brands');
    Array.from(brandsList.children).forEach((li) => li.classList.remove('active')); // Знімаємо активний клас
    event.target.classList.add('active'); // Додаємо активний клас до вибраного елемента

    const models = new Set();
    Object.keys(data).forEach((key) => {
        const [brand, model] = key.split('/');
        if (brand === selectedBrand) {
            models.add(model);
        }
    });

    const modelsList = document.getElementById('models');
    modelsList.innerHTML = '';
    models.forEach((model) => {
        const li = document.createElement('li');
        li.textContent = model;
        li.addEventListener('click', () => handleModelSelection(selectedBrand, model));
        modelsList.appendChild(li);
    });

    document.getElementById('years').innerHTML = ''; // Очищення списку років
    document.getElementById('gallery').innerHTML = ''; // Очищення галереї

    updateSelectionDisplay(selectedBrand, null, null); // Оновлення тексту вибору
}

// Оновлена функція для вибору моделі
function handleModelSelection(selectedBrand, selectedModel) {
    const modelsList = document.getElementById('models');
    Array.from(modelsList.children).forEach((li) => li.classList.remove('active')); // Знімаємо активний клас
    event.target.classList.add('active'); // Додаємо активний клас до вибраного елемента

    const years = new Set();
    Object.keys(data).forEach((key) => {
        const [brand, model, year] = key.split('/');
        if (brand === selectedBrand && model === selectedModel) {
            years.add(year);
        }
    });

    const yearsList = document.getElementById('years');
    yearsList.innerHTML = '';
    years.forEach((year) => {
        const li = document.createElement('li');
        li.textContent = year;
        li.addEventListener('click', () => handleYearSelection(selectedBrand, selectedModel, year));
        yearsList.appendChild(li);
    });

    document.getElementById('gallery').innerHTML = ''; // Очищення галереї

    updateSelectionDisplay(selectedBrand, selectedModel, null); // Оновлення тексту вибору
}

// Оновлена функція для вибору року
function handleYearSelection(selectedBrand, selectedModel, selectedYear) {
    const yearsList = document.getElementById('years');
    Array.from(yearsList.children).forEach((li) => li.classList.remove('active')); // Знімаємо активний клас
    event.target.classList.add('active'); // Додаємо активний клас до вибраного елемента

    currentImages = []; // Очищення списку зображень
    Object.entries(data).forEach(([key, url]) => {
        const [brand, model, year] = key.split('/');
        if (brand === selectedBrand && model === selectedModel && year === selectedYear) {
            currentImages.push(url);
        }
    });

    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';
    currentImages.forEach((src) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Car Image';
        img.classList.add('gallery-image');
        gallery.appendChild(img);
    });

    updateSelectionDisplay(selectedBrand, selectedModel, selectedYear); // Оновлення тексту вибору
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

// Оновлена функція для завантаження галереї
function handleYearSelection(selectedBrand, selectedModel, selectedYear) {
    currentImages = []; // Очищення списку зображень
    Object.entries(data).forEach(([key, url]) => {
        const [brand, model, year] = key.split('/');
        if (brand === selectedBrand && model === selectedModel && year === selectedYear) {
            currentImages.push(url);
        }
    });

    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';
    currentImages.forEach((src) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Car Image';
        img.classList.add('gallery-image');

        // Додавання обробника для відкриття модального вікна
        img.addEventListener('click', () => openModal(src));

        gallery.appendChild(img);
    });

    // Очищення галереї від фото 1x1 і тих, що не завантажилися
    cleanGallery();
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

            // Оновлення підсвічування активного фото
            document.querySelectorAll('.thumbnail-row img').forEach((thumb) => thumb.classList.remove('active'));
            thumbnail.classList.add('active');
        });

        thumbnailRow.appendChild(thumbnail);
    });

    // Відкриття модального вікна
    modal.style.display = 'flex';
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
        currentImageIndex = currentImages.length - 1; // Переходить до останнього фото
    } else if (currentImageIndex >= currentImages.length) {
        currentImageIndex = 0; // Повертається до першого фото
    }
    const modalImage = document.getElementById('modalImage');
    modalImage.src = currentImages[currentImageIndex];

    // Оновлення підсвічування
    createThumbnailRow();
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

// Додаємо елемент для відображення вибору
const selectionDisplay = document.createElement('div');
selectionDisplay.id = 'selectionDisplay';
document.body.insertBefore(selectionDisplay, document.body.firstChild);

// Оновлення тексту вибору
function updateSelectionDisplay(brand, model, year) {
    const displayText = `${brand || ''} ${model || ''} ${year || ''}`.trim(); // Додаємо пробіли між назвами
    selectionDisplay.textContent = `Вибрано: ${displayText}`;
}