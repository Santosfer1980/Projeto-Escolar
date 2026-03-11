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

    function filterItems(query) {
        const normalizedQuery = normalizeText(query);
        const groupCards = document.querySelectorAll(".group-card");
        const bookCards = document.querySelectorAll(".book-card");

        let groupsVisible = 0;
        let booksVisible = 0;

        groupCards.forEach((card) => {
            const searchableText = normalizeText(card.dataset.search + " " + card.textContent);

            const match = normalizedQuery === "" || searchableText.includes(normalizedQuery);
            card.classList.toggle("is-hidden", !match);

            if (match) groupsVisible++;
        });

        bookCards.forEach((card) => {
            const searchableText = normalizeText(card.dataset.search + " " + card.textContent);

            const match = normalizedQuery === "" || searchableText.includes(normalizedQuery);
            card.classList.toggle("is-hidden", !match);

            if (match) booksVisible++;
        });

        if (normalizedQuery === "") {
            searchFeedback.textContent = "Pesquise por áreas, grupos, livros ou habilidades.";
            return;
        }

        if (groupsVisible === 0 && booksVisible === 0) {
            searchFeedback.textContent = `Nenhum resultado encontrado para "${query}".`;
            return;
        }

        searchFeedback.textContent = `Resultados encontrados: ${groupsVisible} grupo(s) e ${booksVisible} livro(s).`;
    }

    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const query = searchInput.value;
        filterItems(query);

        const normalizedQuery = normalizeText(query);
        if (normalizedQuery !== "") {
            const groupsSection = document.getElementById("grupos");
            groupsSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
            updateActiveNav("grupos");
        }
    });

    searchInput.addEventListener("input", () => {
        filterItems(searchInput.value);
    });

    const observedSections = ["inicio", "grupos", "livros"]
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