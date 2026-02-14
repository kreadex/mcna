// ============================
// 1️⃣ Загрузка JSON
// ============================
async function loadData() {
    const [categoriesRes, tagsRes, communitiesRes] = await Promise.all([
        fetch("./data/categories.json"),
        fetch("./data/tags.json"),
        fetch("./data/communities.json")
    ]);

    const categories = await categoriesRes.json();
    const tags = await tagsRes.json();
    const communities = await communitiesRes.json();

    return { categories, tags, communities };
}

// ============================
// 2️⃣ Вспомогательные функции
// ============================

function createMap(arr) {
    const map = {};
    arr.forEach(item => map[item.id] = item);
    return map;
}

function getMembersCount(community) {
    const platforms = community.platforms || {};
    return Object.values(platforms)
        .reduce((sum, p) => sum + (p.members || 0), 0);
}

// ============================
// 3️⃣ Переменные фильтров
// ============================
let selectedCategory = null;
let selectedTag = null;

// ============================
// 4️⃣ Сортировка и фильтрация
// ============================
function sortCommunities(a, b) {
    const ratingA = typeof a.rating === "object" ? a.rating.average : a.rating || 0;
    const ratingB = typeof b.rating === "object" ? b.rating.average : b.rating || 0;

    if (ratingB !== ratingA) return ratingB - ratingA;

    const membersA = getMembersCount(a);
    const membersB = getMembersCount(b);

    return membersB - membersA;
}

function filterCommunities(community) {
    if (selectedCategory && !community.categories.includes(selectedCategory)) return false;
    if (selectedTag && !community.tags.includes(selectedTag)) return false;
    return true;
}

// ============================
// 5️⃣ Создание карточки
// ============================
function createCommunityCard(community, categoriesMap, tagsMap) {

    const categoryNames = community.categories
        .map(id => categoriesMap[id]?.name || id)
        .join(", ");

    const tagsHtml = community.tags
        .map(id => `<p class="tag-item" data-id="${id}">${tagsMap[id]?.name || id}</p>`)
        .join("");

    const platformsHtml = Object.entries(community.platforms || {})
        .map(([platform, data]) => `
            <a href="${data.url}" target="_blank" onclick="event.stopPropagation()" title="${platform}">
                <i class="fab fa-${platform}"></i>
            </a>
        `)
        .join("");

    const extraInfoHtml = Object.entries(community.platforms || {})
        .map(([platform, data]) => `<div>👥 ${platform}: ${data.members}</div>`)
        .join("");

    const ratingValue = typeof community.rating === "object"
        ? community.rating.average
        : community.rating || 0;

    return `
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <img src="assets/catalog/icons/${community.id}.webp"
                        class="card-icon"
                        alt="${community.name}"
                        onerror="this.onerror=null; this.src='assets/catalog/icons/default.svg';">
                    <h2>${community.name}</h2>
                </div>
                <span class="rating">⭐ ${ratingValue}</span>
            </div>

            <div class="meta">
                <span class="category">${categoryNames}</span>
                <span class="tags">${tagsHtml}</span>
            </div>

            <details class="card-details">
                <summary>
                    <div class="summary-content">
                        <p class="short-desc">
                            ${community.description}
                        </p>
                        <div class="links">
                            <div class="platforms">
                                <p>Ссылки:</p>${platformsHtml}
                            </div>
                        </div>
                    </div>
                </summary>

                <div class="extra-info">
                    ${extraInfoHtml}
                    <div>📅 Создано: ${community.created_at}</div>
                </div>
            </details>
        </div>
    `;
}

// ============================
// 6️⃣ Рендер каталога
// ============================
function renderCatalog(communities, categoriesMap, tagsMap) {
    const filtered = communities.filter(filterCommunities).sort(sortCommunities);

    const html = filtered
        .map(c => createCommunityCard(c, categoriesMap, tagsMap))
        .join("");

    document.querySelector(".list").innerHTML = html;

    document.querySelectorAll(".tag-item").forEach(tagEl => {
        tagEl.addEventListener("click", (e) => {
            selectedTag = tagEl.dataset.id === selectedTag ? null : tagEl.dataset.id;
            renderCatalog(communities, categoriesMap, tagsMap);
            e.stopPropagation();
        });
    });
}

// ============================
// 7️⃣ Рендер фильтров категорий и тегов сверху
// ============================
function renderFilters(categories, tags, communities, categoriesMap, tagsMap) {
    const container = document.querySelector(".filters");
    const visibleCount = 6;

    container.innerHTML = `
        <div class="filter-section categories">
            <strong>Категории:</strong>
            <button class="filter-cat" data-id="">Все</button>
            ${categories.map(cat => `<button class="filter-cat" data-id="${cat.id}">${cat.name}</button>`).join("")}
        </div>

        <div class="filter-section tags">
            <strong>Теги:</strong>
            <details class="tags-details">
                <summary>
                    <div class="tags-summary">
                        <button class="filter-tag" data-id="">Все</button>
                        ${tags.slice(0, visibleCount).map(tag => `<button class="filter-tag" data-id="${tag.id}">${tag.name}</button>`).join("")}
                        ${tags.length > visibleCount ? `<span class="more-tags">+${tags.length - visibleCount}</span>` : ''}
                    </div>
                </summary>
                <div class="tags-full">
                    ${tags.slice(visibleCount).map(tag => `<button class="filter-tag" data-id="${tag.id}">${tag.name}</button>`).join("")}
                </div>
            </details>
        </div>
    `;

    document.querySelectorAll(".filter-cat").forEach(btn => {
        btn.addEventListener("click", () => {
            selectedCategory = btn.dataset.id || null;
            renderCatalog(communities, categoriesMap, tagsMap);
            updateActiveFilter();
        });
    });

    document.querySelectorAll(".filter-tag").forEach(btn => {
        btn.addEventListener("click", (e) => {
            selectedTag = btn.dataset.id || null;
            renderCatalog(communities, categoriesMap, tagsMap);
            updateActiveFilter();
            e.stopPropagation(); 
        });
    });
}

function updateActiveFilter() {
    document.querySelectorAll(".filter-cat").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.id === (selectedCategory || ""));
    });
    document.querySelectorAll(".filter-tag").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.id === (selectedTag || ""));
    });
}


// ============================
// 8️⃣ Инициализация
// ============================
async function initCatalog() {
    const { categories, tags, communities } = await loadData();
    const categoriesMap = createMap(categories);
    const tagsMap = createMap(tags);

    renderFilters(categories, tags, communities, categoriesMap, tagsMap);
    renderCatalog(communities, categoriesMap, tagsMap);
}

initCatalog();
