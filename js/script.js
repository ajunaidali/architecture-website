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
     1. PRELOADER — reveal the site the moment assets are ready.
     Keeps a short minimum so the intro feels premium, and hard-caps
     the total time so the loader can never delay the page.
  ------------------------------------------------------------------ */
  (function initPreloader() {
    const pre = $("#preloader");
    if (!pre) return;
    const MIN_VISIBLE = 1200;   // premium minimum (ms)
    const MAX_VISIBLE = 1800;   // hard cap (ms)
    const start = performance.now();
    let done = false;

    const hide = () => {
      if (done) return;
      done = true;
      const wait = Math.max(0, MIN_VISIBLE - (performance.now() - start));
      setTimeout(() => {
        pre.classList.add("hidden");
        document.body.classList.remove("is-loading");
        // remove from the DOM after the fade so it never intercepts input
        pre.addEventListener("transitionend", () => pre.remove(), { once: true });
        setTimeout(() => pre.remove(), 700);
      }, wait);
    };

    if (document.readyState === "complete") hide();
    else window.addEventListener("load", hide, { once: true });
    // Safety cap: reveal regardless of slow/stalled assets
    setTimeout(hide, MAX_VISIBLE);
  })();

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
  const heroBg = $(".hero .hero-bg");
  const backTopBtn = $(".back-top");
  const vh = () => window.innerHeight;
  let ticking = false;
  const render = () => {
    const y = window.scrollY;
    if (navbar) navbar.classList.toggle("scrolled", y > 40);
    if (backTopBtn) backTopBtn.classList.toggle("show", y > 500);
    // GPU-friendly parallax — only while the hero is on screen
    if (heroBg && y < vh()) heroBg.style.transform = `translate3d(0, ${y * 0.35}px, 0)`;
    ticking = false;
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(render);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  render();

  /* ------------------------------------------------------------------
     4. MOBILE MENU — premium slide-in nav with blurred overlay,
     animated close, icons, scroll-lock, focus-trap & ARIA.
     Enhancements are injected here so every page stays in sync.
  ------------------------------------------------------------------ */
  const hamburger = $(".hamburger");
  const mobileMenu = $(".mobile-menu");
  let toggleMenu = () => {};

  if (hamburger && mobileMenu) {
    // Orange chevron shown at the right of every menu item
    const itemArrow =
      '<span class="mm-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></span>';

    // Rebuild the panel from the existing page links (never renaming or
    // re-routing them): logo header → item list → fixed WhatsApp CTA.
    const navLinks = $$("a:not(.btn)", mobileMenu);
    $$(".btn", mobileMenu).forEach((b) => b.remove());

    const list = document.createElement("div");
    list.className = "mm-list";
    navLinks.forEach((a) => {
      const label = a.textContent.trim();
      a.className = "mm-item";
      a.innerHTML = '<span class="mm-label">' + label + "</span>" + itemArrow;
      list.appendChild(a);
    });

    const header = document.createElement("div");
    header.className = "mm-header";
    header.innerHTML =
      '<a class="mm-brand" href="index.html" aria-label="Ahmed Engineering Company home">' +
      '<img src="images/logo.png" alt="AEC logo" /></a>' +
      '<button class="mm-close" type="button" aria-label="Close menu">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
      "</button>";

    // Reuse the WhatsApp number already configured on the site (float button)
    const waSource = $(".whatsapp-float");
    const waHref = (waSource && waSource.getAttribute("href"))
      || "https://wa.me/923080296473?text=Hello%20Ahmed%20Engineering%20Company%2C%20I%20need%20information%20about%20your%20construction%20services.";

    const footer = document.createElement("a");
    footer.className = "mm-footer";
    footer.href = waHref;
    footer.target = "_blank";
    footer.rel = "noopener";
    footer.setAttribute("aria-label", "Start a WhatsApp chat with Ahmed Engineering Company");
    footer.innerHTML =
      '<span class="mm-wa-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15l-1 3.6 3.7-1A10 10 0 1012 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2s-1.2.2-3.7-.9-4-3.6-4.2-3.8-1-1.3-1-2.5.6-1.8.9-2.1c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.4-.1.7s.7 1.2 1.5 1.9c1 .9 1.8 1.1 2.1 1.3s.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.9.9c.2.1.4.2.5.3s.1.7-.1 1.3z"/></svg></span>' +
      '<span class="mm-wa-label">Start a WhatsApp Chat</span>' +
      '<span class="mm-footer-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>';

    mobileMenu.innerHTML = "";
    mobileMenu.append(header, list, footer);

    // Overlay that fades in behind the menu
    let overlay = $(".menu-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "menu-overlay";
      document.body.appendChild(overlay);
    }

    // Wire up ARIA
    if (!mobileMenu.id) mobileMenu.id = "mobileMenu";
    mobileMenu.setAttribute("aria-hidden", "true");
    hamburger.setAttribute("aria-controls", mobileMenu.id);
    hamburger.setAttribute("aria-expanded", "false");

    // Stagger the item reveal
    const items = $$(".mm-item", mobileMenu);
    items.forEach((a, i) => (a.style.animationDelay = 0.08 + i * 0.06 + "s"));

    const getFocusable = () =>
      $$('a[href], button:not([disabled])', mobileMenu).filter((el) => el.offsetParent !== null);

    let lastFocused = null;

    toggleMenu = (force) => {
      const open = force !== undefined ? force : !mobileMenu.classList.contains("open");
      mobileMenu.classList.toggle("open", open);
      overlay.classList.toggle("show", open);
      hamburger.classList.toggle("open", open);
      hamburger.setAttribute("aria-expanded", String(open));
      hamburger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      mobileMenu.setAttribute("aria-hidden", String(!open));
      document.body.classList.toggle("menu-open", open);
      if (open) {
        lastFocused = document.activeElement;
        const f = getFocusable();
        if (f[0]) setTimeout(() => f[0].focus(), 300);
      } else if (lastFocused) {
        lastFocused.focus();
      }
    };

    hamburger.addEventListener("click", () => toggleMenu());
    overlay.addEventListener("click", () => toggleMenu(false));
    $(".mm-close", mobileMenu).addEventListener("click", () => toggleMenu(false));
    $$("a", mobileMenu).forEach((a) => a.addEventListener("click", () => toggleMenu(false)));

    document.addEventListener("keydown", (e) => {
      if (!mobileMenu.classList.contains("open")) return;
      if (e.key === "Escape") { toggleMenu(false); return; }
      if (e.key === "Tab") {
        const f = getFocusable();
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

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

  /* ------------------------------------------------------------------
     21. MOSQUE DOME PORTFOLIO — timeline progress + premium lightbox
     Self-contained: only runs on the Projects page. Supports keyboard
     navigation, wheel zoom, pinch-to-zoom, drag-to-pan, swipe gestures,
     lazy loading with a loading spinner, counter and captions.
  ------------------------------------------------------------------ */
  (function initMosquePortfolio() {
    const timeline = $("#mosqueGallery");

    // Animate the connecting timeline line when it scrolls into view
    if (timeline && "IntersectionObserver" in window) {
      const tio = new IntersectionObserver((entries, obs) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add("mdp-animate"); obs.unobserve(en.target); }
        });
      }, { threshold: 0.2 });
      tio.observe(timeline);
    } else if (timeline) {
      timeline.classList.add("mdp-animate");
    }

    const lb = $("#mosqueLightbox");
    if (!lb || !timeline) return;

    const triggers = $$(".mdp-step-media", timeline);
    const slides = triggers.map((btn) => {
      const img = $("img", btn);
      const heading = $(".mdp-step-text h4", btn.closest(".mdp-step"));
      return { src: img.getAttribute("src"), alt: img.alt || "", caption: (heading && heading.textContent.trim()) || img.alt || "" };
    });
    if (!slides.length) return;

    const lbImg = $(".mdp-lb-img", lb);
    const spinner = $(".mdp-lb-spinner", lb);
    const counter = $(".mdp-lb-counter", lb);
    const caption = $(".mdp-lb-caption", lb);
    const stage = $(".mdp-lb-stage", lb);
    const closeBtn = $(".mdp-lb-close", lb);
    const prevBtn = $(".mdp-lb-prev", lb);
    const nextBtn = $(".mdp-lb-next", lb);

    let index = 0;
    let loadToken = 0;
    let scale = 1, tx = 0, ty = 0;
    let isDragging = false, dragStartX = 0, dragStartY = 0, baseTx = 0, baseTy = 0;
    let prefetched = false;

    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

    const prefetchAll = () => {
      if (prefetched) return;
      prefetched = true;
      slides.forEach((s) => { const i = new Image(); i.src = s.src; });
    };

    const applyTransform = (smooth) => {
      lbImg.style.transition = smooth ? "transform 0.3s cubic-bezier(0.16,1,0.3,1)" : "none";
      lbImg.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
      lbImg.classList.toggle("zoomed", scale > 1.01);
    };
    const resetZoom = () => { scale = 1; tx = 0; ty = 0; };

    const render = (dir) => {
      const token = ++loadToken;
      counter.textContent = (index + 1) + " / " + slides.length;
      caption.textContent = slides[index].caption;
      resetZoom();
      spinner.classList.add("show");
      lbImg.classList.remove("loaded");

      const pre = new Image();
      const src = slides[index].src;
      const show = () => {
        if (token !== loadToken) return;
        lbImg.src = src;
        lbImg.alt = slides[index].alt;
        lbImg.style.transition = "none";
        lbImg.style.transform = `translateX(${(dir || 0) * 48}px) scale(1)`;
        void lbImg.offsetWidth;
        lbImg.style.transition = "opacity 0.45s ease, transform 0.45s cubic-bezier(0.16,1,0.3,1)";
        lbImg.classList.add("loaded");
        lbImg.style.transform = "translateX(0) scale(1)";
        spinner.classList.remove("show");
      };
      pre.onload = show;
      pre.onerror = show;
      pre.src = src;
      if (pre.complete && pre.naturalWidth) show();
    };

    let lastFocused = null;
    const open = (i) => {
      index = clamp(i, 0, slides.length - 1);
      lb.classList.add("open");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      document.body.classList.add("mdp-lb-active");
      lastFocused = document.activeElement;
      render(0);
      prefetchAll();
      closeBtn.focus();
    };
    const close = () => {
      lb.classList.remove("open");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      document.body.classList.remove("mdp-lb-active");
      resetZoom();
      applyTransform(false);
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    };
    const go = (dir) => {
      index = (index + dir + slides.length) % slides.length;
      render(dir);
    };

    triggers.forEach((btn, i) => btn.addEventListener("click", () => open(i)));
    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", () => go(-1));
    nextBtn.addEventListener("click", () => go(1));
    $(".mdp-lb-backdrop", lb).addEventListener("click", close);

    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      else if (e.key === "Home") { e.preventDefault(); index = 0; render(-1); }
      else if (e.key === "End") { e.preventDefault(); index = slides.length - 1; render(1); }
      else if (e.key === "Tab") {
        // Keep focus trapped inside the lightbox controls
        const focusables = [closeBtn, prevBtn, nextBtn];
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    /* --- Mouse wheel zoom --- */
    stage.addEventListener("wheel", (e) => {
      if (!lb.classList.contains("open")) return;
      e.preventDefault();
      const prev = scale;
      scale = clamp(scale - e.deltaY * 0.0016 * scale, 1, 4);
      if (scale <= 1.01) { tx = 0; ty = 0; }
      else {
        const f = scale / prev;
        tx *= f; ty *= f;
      }
      applyTransform(true);
    }, { passive: false });

    /* --- Double click / double tap to toggle zoom --- */
    stage.addEventListener("dblclick", () => {
      if (scale > 1.01) { resetZoom(); } else { scale = 2.4; }
      applyTransform(true);
    });

    /* --- Drag to pan (mouse) when zoomed --- */
    stage.addEventListener("mousedown", (e) => {
      if (scale <= 1.01) return;
      isDragging = true; dragStartX = e.clientX; dragStartY = e.clientY; baseTx = tx; baseTy = ty;
      lbImg.classList.add("dragging");
      e.preventDefault();
    });
    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      tx = baseTx + (e.clientX - dragStartX);
      ty = baseTy + (e.clientY - dragStartY);
      applyTransform(false);
    });
    window.addEventListener("mouseup", () => { isDragging = false; lbImg.classList.remove("dragging"); });

    /* --- Touch: swipe to navigate, drag to pan, pinch to zoom --- */
    let touchStartX = 0, touchStartY = 0, startTx = 0, startTy = 0;
    let pinchStartDist = 0, pinchStartScale = 1, isPinching = false, touchMoved = false;
    const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    stage.addEventListener("touchstart", (e) => {
      if (e.touches.length === 2) {
        isPinching = true;
        pinchStartDist = dist(e.touches);
        pinchStartScale = scale;
      } else if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        startTx = tx; startTy = ty; touchMoved = false;
      }
    }, { passive: true });

    stage.addEventListener("touchmove", (e) => {
      if (isPinching && e.touches.length === 2) {
        e.preventDefault();
        const f = dist(e.touches) / (pinchStartDist || 1);
        scale = clamp(pinchStartScale * f, 1, 4);
        if (scale <= 1.01) { tx = 0; ty = 0; }
        applyTransform(false);
      } else if (e.touches.length === 1 && scale > 1.01) {
        e.preventDefault();
        tx = startTx + (e.touches[0].clientX - touchStartX);
        ty = startTy + (e.touches[0].clientY - touchStartY);
        touchMoved = true;
        applyTransform(false);
      } else if (e.touches.length === 1) {
        if (Math.abs(e.touches[0].clientX - touchStartX) > 8) touchMoved = true;
      }
    }, { passive: false });

    stage.addEventListener("touchend", (e) => {
      if (isPinching) {
        isPinching = false;
        if (scale <= 1.01) { resetZoom(); applyTransform(true); }
        return;
      }
      if (scale <= 1.01 && touchMoved) {
        const dx = (e.changedTouches[0].clientX - touchStartX);
        if (Math.abs(dx) > 55) go(dx < 0 ? 1 : -1);
      }
    });
  })();
})();
