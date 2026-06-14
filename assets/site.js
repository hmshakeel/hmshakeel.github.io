(function () {
  const body = document.body;
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const navigation = document.querySelector("[data-navigation]");

  if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
      const expanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!expanded));
      menuToggle.setAttribute("aria-label", expanded ? "Open navigation" : "Close navigation");
      navigation.classList.toggle("is-open", !expanded);
      body.classList.toggle("nav-open", !expanded);
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        navigation.classList.remove("is-open");
        body.classList.remove("nav-open");
      });
    });
  }

  const currentPage = document.documentElement.dataset.page;
  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.dataset.nav === currentPage) {
      link.setAttribute("aria-current", "page");
    }
  });

  document.querySelectorAll("[data-year]").forEach((target) => {
    target.textContent = new Date().getFullYear();
  });

  const counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target;
        const finalValue = Number(target.dataset.count || "0");
        const duration = 900;
        const start = performance.now();

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          target.textContent = Math.round(finalValue * eased).toString();
          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
        observer.unobserve(target);
      });
    }, { threshold: 0.45 });

    counters.forEach((counter) => counterObserver.observe(counter));
  }

  function setupFilters(scopeSelector, itemSelector) {
    const scope = document.querySelector(scopeSelector);
    if (!scope) return;

    const buttons = scope.querySelectorAll("[data-filter]");
    const search = scope.querySelector("[data-search]");
    const items = scope.querySelectorAll(itemSelector);
    const count = scope.querySelector("[data-results-count]");

    let activeFilter = "all";

    const update = () => {
      const query = (search?.value || "").trim().toLowerCase();
      let visible = 0;

      items.forEach((item) => {
        const itemFilters = (item.dataset.filter || "").split(/\s+/);
        const filterMatch = activeFilter === "all" || itemFilters.includes(activeFilter);
        const textMatch = !query || item.textContent.toLowerCase().includes(query);
        const shouldShow = filterMatch && textMatch;
        item.classList.toggle("is-hidden", !shouldShow);
        if (shouldShow) visible += 1;
      });

      if (count) {
        count.textContent = `${visible} result${visible === 1 ? "" : "s"}`;
      }
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.filter || "all";
        buttons.forEach((candidate) => {
          candidate.classList.toggle("is-active", candidate === button);
          candidate.setAttribute("aria-pressed", String(candidate === button));
        });
        update();
      });
    });

    search?.addEventListener("input", update);
    update();
  }

  setupFilters("[data-project-filters]", "[data-project]");
  setupFilters("[data-publication-filters]", "[data-publication]");

  const copyEmailButton = document.querySelector("[data-copy-email]");
  if (copyEmailButton) {
    copyEmailButton.addEventListener("click", async () => {
      const email = copyEmailButton.dataset.copyEmailValue || "hmshakeel.567@gmail.com";
      const status = document.querySelector("[data-copy-status]");
      try {
        await navigator.clipboard.writeText(email);
        if (status) status.textContent = "Email copied.";
      } catch {
        if (status) status.textContent = email;
      }
    });
  }

  const contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(contactForm);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const topic = String(formData.get("topic") || "Research collaboration").trim();
      const message = String(formData.get("message") || "").trim();
      const status = contactForm.querySelector("[data-form-status]");

      if (!name || !email || !message) {
        if (status) status.textContent = "Please complete name, email and message.";
        return;
      }

      const subject = encodeURIComponent(`${topic} inquiry from ${name}`);
      const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${email}`);
      window.location.href = `mailto:hmshakeel.567@gmail.com?subject=${subject}&body=${body}`;
      if (status) status.textContent = "Opening your email app.";
    });
  }
})();
