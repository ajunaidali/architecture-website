/* =====================================================================
   Ahmed Engineering Company (AEC) — Main JavaScript (Vanilla JS)
   Features: Preloader, Theme toggle, Sticky navbar, Mobile menu,
   Smooth scroll, Ripple, Scroll reveal, Counters, Progress bars,
   Project/Property/Gallery filters, Lightbox, Testimonials slider,
   FAQ accordion, Back-to-top, Form validation, Quote modal,
   Parallax hero, Company profile download.
   ===================================================================== */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ------------------------------------------------------------------
     1. PRELOADER — hide once page fully loaded
  ------------------------------------------------------------------ */
  window.addEventListener("load", () => {
    const pre = $("#preloader");
    if (pre) setTimeout(() => pre.classList.add("hidden"), 3000);
  });
  // Safety: never leave the preloader stuck
  setTimeout(() => { const p = $("#preloader"); if (p) p.classList.add("hidden"); }, 4000);

  /* ------------------------------------------------------------------
     2. THEME TOGGLE (dark / light) with localStorage persistence
  ------------------------------------------------------------------ */
  const THEME_KEY = "aec-theme";
  const applyTheme = (t) => {
    document.documentElement.setAttribute("data-theme", t);
    $$(".theme-toggle").forEach((b) => (b.dataset.theme = t));
  };
  const savedTheme = localStorage.getItem(THEME_KEY)
    || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  applyTheme(savedTheme);
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".theme-toggle");
    if (!btn) return;
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });

  /* ------------------------------------------------------------------
     3. STICKY NAVBAR — add .scrolled after threshold
  ------------------------------------------------------------------ */
  const navbar = $(".navbar");
  const onScroll = () => {
    if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 40);
    // back to top visibility
    const bt = $(".back-top");
    if (bt) bt.classList.toggle("show", window.scrollY > 500);
    // parallax hero
    if (heroBg) {
      const y = window.scrollY;
      if (y < window.innerHeight) heroBg.style.transform = `translateY(${y * 0.35}px)`;
    }
  };
  const heroBg = $(".hero .hero-bg");
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------
     4. MOBILE MENU
  ------------------------------------------------------------------ */
  const hamburger = $(".hamburger");
  const mobileMenu = $(".mobile-menu");
  const toggleMenu = (force) => {
    if (!hamburger || !mobileMenu) return;
    const open = force !== undefined ? force : !mobileMenu.classList.contains("open");
    mobileMenu.classList.toggle("open", open);
    hamburger.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  if (hamburger) hamburger.addEventListener("click", () => toggleMenu());
  $$(".mobile-menu a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));

  /* ------------------------------------------------------------------
     5. ACTIVE NAV LINK (based on current filename)
  ------------------------------------------------------------------ */
  const path = location.pathname.split("/").pop() || "index.html";
  $$(".nav-links a, .mobile-menu a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) a.classList.add("active");
  });

  /* ------------------------------------------------------------------
     6. SMOOTH SCROLL for in-page anchors
  ------------------------------------------------------------------ */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  /* ------------------------------------------------------------------
     7. RIPPLE BUTTON EFFECT
  ------------------------------------------------------------------ */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn");
    if (!btn) return;
    const circle = document.createElement("span");
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    circle.className = "ripple";
    circle.style.width = circle.style.height = size + "px";
    circle.style.left = e.clientX - rect.left - size / 2 + "px";
    circle.style.top = e.clientY - rect.top - size / 2 + "px";
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 650);
  });

  /* ------------------------------------------------------------------
     8. SCROLL REVEAL (IntersectionObserver)
  ------------------------------------------------------------------ */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ------------------------------------------------------------------
     9. ANIMATED COUNTERS
  ------------------------------------------------------------------ */
  const counters = $$("[data-count]");
  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const dur = 1800;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target % 1 === 0 ? Math.floor(eased * target) : (eased * target).toFixed(1);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(step);
  };
  if (counters.length && "IntersectionObserver" in window) {
    const cio = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => { if (en.isIntersecting) { runCounter(en.target); obs.unobserve(en.target); } });
    }, { threshold: 0.5 });
    counters.forEach((c) => cio.observe(c));
  }

  /* ------------------------------------------------------------------
     10. PROGRESS BARS (live project progress)
  ------------------------------------------------------------------ */
  const bars = $$(".progress-fill");
  if (bars.length && "IntersectionObserver" in window) {
    const bio = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.style.width = en.target.dataset.value + "%"; obs.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    bars.forEach((b) => bio.observe(b));
  }

  /* ------------------------------------------------------------------
     11. GENERIC ITEM FILTER (projects & gallery)
  ------------------------------------------------------------------ */
  const initFilter = (barSel, itemSel) => {
    const bar = $(barSel);
    if (!bar) return;
    const items = $$(itemSel);
    bar.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      $$(".filter-btn", bar).forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.filter;
      items.forEach((it) => {
        const show = cat === "all" || it.dataset.category === cat;
        it.style.display = show ? "" : "none";
        if (show) { it.classList.remove("in"); void it.offsetWidth; it.classList.add("in"); }
      });
    });
  };
  initFilter("#projectFilter", ".project-item");
  initFilter("#galleryFilter", ".g-item");

  /* ------------------------------------------------------------------
     12. PROPERTY SEARCH + FILTER (buy & sell)
  ------------------------------------------------------------------ */
  const propSearch = $("#propSearch");
  if (propSearch) {
    const kw = $("#propKeyword");
    const loc = $("#propLocation");
    const price = $("#propPrice");
    const status = $("#propStatus");
    const cards = $$(".property-card");
    const noRes = $("#propNoResults");
    const applyFilters = () => {
      const kwv = (kw?.value || "").toLowerCase().trim();
      const locv = loc?.value || "all";
      const prv = price?.value || "all";
      const stv = status?.value || "all";
      let visible = 0;
      cards.forEach((c) => {
        const matchKw = !kwv || c.dataset.title.toLowerCase().includes(kwv) || c.dataset.location.toLowerCase().includes(kwv);
        const matchLoc = locv === "all" || c.dataset.location === locv;
        const matchStatus = stv === "all" || c.dataset.status === stv;
        let matchPrice = true;
        if (prv !== "all") {
          const p = parseInt(c.dataset.price, 10);
          const [min, max] = prv.split("-").map(Number);
          matchPrice = p >= min && (isNaN(max) || p <= max);
        }
        const show = matchKw && matchLoc && matchStatus && matchPrice;
        c.style.display = show ? "" : "none";
        if (show) visible++;
      });
      if (noRes) noRes.classList.toggle("show", visible === 0);
    };
    propSearch.addEventListener("submit", (e) => { e.preventDefault(); applyFilters(); });
    [kw, loc, price, status].forEach((el) => el && el.addEventListener("input", applyFilters));
    [loc, price, status].forEach((el) => el && el.addEventListener("change", applyFilters));
  }

  /* ------------------------------------------------------------------
     13. LIGHTBOX (gallery)
  ------------------------------------------------------------------ */
  const lightbox = $("#lightbox");
  if (lightbox) {
    const lbImg = $(".lb-img", lightbox);
    const lbCap = $(".lb-caption", lightbox);
    const galleryImgs = $$(".g-item");
    let current = 0;
    const openLB = (i) => {
      current = i;
      const el = galleryImgs[i];
      const img = $("img", el);
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = el.dataset.caption || img.alt || "";
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
    };
    const closeLB = () => { lightbox.classList.remove("open"); document.body.style.overflow = ""; };
    const nav = (dir) => {
      // move to next/prev visible item
      let i = current;
      do { i = (i + dir + galleryImgs.length) % galleryImgs.length; }
      while (galleryImgs[i].style.display === "none" && i !== current);
      openLB(i);
    };
    galleryImgs.forEach((el, i) => el.addEventListener("click", () => openLB(i)));
    $(".lb-close", lightbox).addEventListener("click", closeLB);
    $(".lb-prev", lightbox).addEventListener("click", () => nav(-1));
    $(".lb-next", lightbox).addEventListener("click", () => nav(1));
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLB(); });
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLB();
      if (e.key === "ArrowLeft") nav(-1);
      if (e.key === "ArrowRight") nav(1);
    });
  }

  /* ------------------------------------------------------------------
     14. TESTIMONIALS SLIDER
  ------------------------------------------------------------------ */
  const slider = $("#testiSlider");
  if (slider) {
    const slides = $(".testi-slides", slider);
    const count = $$(".testi-slide", slides).length;
    const dotsWrap = $(".testi-dots", slider);
    let index = 0, timer = null;
    // build dots
    if (dotsWrap) {
      for (let i = 0; i < count; i++) {
        const d = document.createElement("button");
        d.className = "testi-dot" + (i === 0 ? " active" : "");
        d.setAttribute("aria-label", "Go to slide " + (i + 1));
        d.addEventListener("click", () => go(i));
        dotsWrap.appendChild(d);
      }
    }
    const go = (i) => {
      index = (i + count) % count;
      slides.style.transform = `translateX(-${index * 100}%)`;
      $$(".testi-dot", slider).forEach((d, di) => d.classList.toggle("active", di === index));
    };
    const next = () => go(index + 1);
    const prev = () => go(index - 1);
    $(".testi-next", slider)?.addEventListener("click", () => { next(); restart(); });
    $(".testi-prev", slider)?.addEventListener("click", () => { prev(); restart(); });
    const start = () => (timer = setInterval(next, 5500));
    const restart = () => { clearInterval(timer); start(); };
    slider.addEventListener("mouseenter", () => clearInterval(timer));
    slider.addEventListener("mouseleave", start);
    start();
  }

  /* ------------------------------------------------------------------
     15. FAQ ACCORDION
  ------------------------------------------------------------------ */
  $$(".faq-item").forEach((item) => {
    const q = $(".faq-q", item);
    const a = $(".faq-a", item);
    q.addEventListener("click", () => {
      const open = item.classList.contains("open");
      $$(".faq-item").forEach((it) => { it.classList.remove("open"); $(".faq-a", it).style.maxHeight = null; });
      if (!open) { item.classList.add("open"); a.style.maxHeight = a.scrollHeight + "px"; }
    });
  });

  /* ------------------------------------------------------------------
     16. BACK TO TOP
  ------------------------------------------------------------------ */
  const backTop = $(".back-top");
  if (backTop) backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ------------------------------------------------------------------
     17. FORM VALIDATION (contact + quote + newsletter)
  ------------------------------------------------------------------ */
  const showFieldError = (field, msg) => {
    field.classList.add("invalid");
    const e = $(".error-msg", field);
    if (e && msg) e.textContent = msg;
  };
  const clearFieldError = (field) => field.classList.remove("invalid");
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRe = /^[0-9+\-\s()]{7,}$/;

  const validateForm = (form) => {
    let valid = true;
    $$(".field", form).forEach((field) => {
      const input = $("input, textarea, select", field);
      if (!input || !input.hasAttribute("data-required")) return;
      const val = input.value.trim();
      clearFieldError(field);
      if (!val) { showFieldError(field, "This field is required."); valid = false; return; }
      if (input.type === "email" && !emailRe.test(val)) { showFieldError(field, "Enter a valid email address."); valid = false; }
      if (input.dataset.type === "phone" && !phoneRe.test(val)) { showFieldError(field, "Enter a valid phone number."); valid = false; }
    });
    return valid;
  };

  $$("form[data-validate]").forEach((form) => {
    // live clearing
    $$("input, textarea, select", form).forEach((input) =>
      input.addEventListener("input", () => clearFieldError(input.closest(".field")))
    );
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validateForm(form)) return;
      const success = $(".form-success", form) || $("#" + form.dataset.success);
      if (success) {
        success.classList.add("show");
        success.textContent = form.dataset.message || "Thank you! Your message has been sent. We will contact you shortly.";
      }
      form.reset();
      // close modal if inside one
      const modal = form.closest(".modal");
      if (modal) setTimeout(() => closeModal(modal), 1600);
      if (success) setTimeout(() => success.classList.remove("show"), 6000);
    });
  });

  /* ------------------------------------------------------------------
     18. MODALS (Request a Quote popup)
  ------------------------------------------------------------------ */
  const openModal = (m) => { m.classList.add("open"); document.body.style.overflow = "hidden"; };
  const closeModal = (m) => { m.classList.remove("open"); document.body.style.overflow = ""; };
  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-modal-open]");
    if (opener) { const m = $("#" + opener.dataset.modalOpen); if (m) { e.preventDefault(); openModal(m); } }
    const closer = e.target.closest("[data-modal-close], .modal-backdrop");
    if (closer) { const m = closer.closest(".modal"); if (m) closeModal(m); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") $$(".modal.open").forEach(closeModal);
  });

  /* ------------------------------------------------------------------
     19. DOWNLOAD COMPANY PROFILE (generated on the fly)
  ------------------------------------------------------------------ */
  $$("[data-download-profile]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const profile = `AHMED ENGINEERING COMPANY (AEC)
Constructor - Builders & Developers
Consultant: All Civil Engineering Solutions
========================================

Director: M. Shakeel Shaikh

Office Address:
R-2, 2nd Floor, VIP Block-2, Ahsanabad, Karachi

Mobile: 0314-4515331 | 0308-0296473
Email: ahmedac717@gmail.com

----------------------------------------
ABOUT US
Ahmed Engineering Company is a premium construction, civil
engineering and development firm delivering residential,
commercial and industrial projects with engineering
excellence and 20+ years of combined experience.

SERVICES
- Residential & Commercial Construction
- Architecture & Interior Design
- Civil Engineering Consultancy
- Structural Design & Renovation
- Project Management & Construction Supervision
- Building Approval, Road Construction & Infrastructure

WHY CHOOSE US
20+ Years Experience | 500+ Projects | 150+ Happy Clients

© Ahmed Engineering Company. All Rights Reserved.`;
      const blob = new Blob([profile], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "AEC-Company-Profile.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  });

  /* ------------------------------------------------------------------
     20. Footer year
  ------------------------------------------------------------------ */
  $$(".js-year").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
