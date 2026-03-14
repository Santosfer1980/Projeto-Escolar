document.addEventListener("DOMContentLoaded", () => {
    const clickableCards = document.querySelectorAll(".clickable-card");
    const navItems = document.querySelectorAll(".nav-item");
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");
    const searchFeedback = document.getElementById("searchFeedback");

    function scrollToSection(targetId) {
        const target = document.getElementById(targetId);
        if (!target) return;

        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        updateActiveNav(targetId);
    }

    function updateActiveNav(targetId) {
        navItems.forEach((item) => {
            item.classList.toggle("active", item.dataset.target === targetId);
        });
    }

    clickableCards.forEach((card) => {
        const targetId = card.dataset.target;

        card.addEventListener("click", () => {
            scrollToSection(targetId);
        });

        card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                scrollToSection(targetId);
            }
        });
    });

    navItems.forEach((item) => {
        item.addEventListener("click", () => {
            scrollToSection(item.dataset.target);
        });
    });

    function normalizeText(text) {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    function filterCollection(cards, normalizedQuery) {
        let visibleCount = 0;

        cards.forEach((card) => {
            const searchableText = normalizeText(
                `${card.dataset.search || ""} ${card.textContent || ""}`
            );

            const match = normalizedQuery === "" || searchableText.includes(normalizedQuery);
            card.classList.toggle("is-hidden", !match);

            if (match) {
                visibleCount++;
            }
        });

        return visibleCount;
    }

    function filterItems(query) {
        const normalizedQuery = normalizeText(query);

        const groupCards = document.querySelectorAll(".group-card");
        const bookCards = document.querySelectorAll(".book-card");
        const productCards = document.querySelectorAll(".product-card");

        const groupsVisible = filterCollection(groupCards, normalizedQuery);
        const booksVisible = filterCollection(bookCards, normalizedQuery);
        const productsVisible = filterCollection(productCards, normalizedQuery);

        if (normalizedQuery === "") {
            searchFeedback.textContent = "Pesquise por áreas, grupos, livros, mapas mentais, resumos ou materiais de apoio.";
            return {
                groupsVisible,
                booksVisible,
                productsVisible
            };
        }

        const totalVisible = groupsVisible + booksVisible + productsVisible;

        if (totalVisible === 0) {
            searchFeedback.textContent = `Nenhum resultado encontrado para "${query}".`;
            return {
                groupsVisible,
                booksVisible,
                productsVisible
            };
        }

        searchFeedback.textContent =
            `Resultados encontrados: ${groupsVisible} grupo(s), ${booksVisible} livro(s) e ${productsVisible} material(is).`;

        return {
            groupsVisible,
            booksVisible,
            productsVisible
        };
    }

    function scrollToFirstResultSection(resultCounts) {
        const { groupsVisible, booksVisible, productsVisible } = resultCounts;

        if (groupsVisible > 0) {
            scrollToSection("grupos");
            return;
        }

        if (booksVisible > 0) {
            scrollToSection("livros");
            return;
        }

        if (productsVisible > 0) {
            scrollToSection("lojinha");
        }
    }

    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const query = searchInput.value;
        const resultCounts = filterItems(query);
        const normalizedQuery = normalizeText(query);

        if (normalizedQuery !== "") {
            scrollToFirstResultSection(resultCounts);
        }
    });

    searchInput.addEventListener("input", () => {
        filterItems(searchInput.value);
    });

    const observedSections = ["inicio", "grupos", "livros", "lojinha", "parceiros"]
        .map((id) => document.getElementById(id))
        .filter(Boolean);

    const observer = new IntersectionObserver(
        (entries) => {
            const visibleEntry = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

            if (visibleEntry) {
                updateActiveNav(visibleEntry.target.id);
            }
        },
        {
            threshold: 0.35
        }
    );

    observedSections.forEach((section) => observer.observe(section));

    filterItems("");
});