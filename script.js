/* ==========================================================================
   LandInKutch Consultant - Interactive JavaScript & Reload Router
   ========================================================================== */

// Immediately redirect to Homepage on ANY browser refresh/reload
(function() {
  var perfEntries = performance.getEntriesByType("navigation");
  var isReload = (perfEntries.length > 0 && perfEntries[0].type === "reload") || 
                 (performance.navigation && performance.navigation.type === 1) ||
                 sessionStorage.getItem("is_reloading") === "true";

  sessionStorage.removeItem("is_reloading");

  if (isReload) {
    if (window.location.pathname !== '/' && window.location.pathname !== '') {
      window.location.replace('/');
    } else {
      window.scrollTo(0, 0);
      if (window.location.hash) {
        history.replaceState(null, null, '/');
      }
    }
  }
})();

window.addEventListener("beforeunload", function() {
  sessionStorage.setItem("is_reloading", "true");
});

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Header & Mobile Menu
  const header = document.getElementById('header');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      if (navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
      } else {
        navLinks.style.display = 'flex';
      }
    });
  }

  // 2. Active Nav Link Highlighting based on current pathname
  const currentPath = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-link, .dropdown-item').forEach(link => {
    const href = link.getAttribute('href')?.toLowerCase().replace(/\/$/, '') || '/';
    if (href === currentPath || (currentPath === '' && href === '/') || (href !== '/' && currentPath.includes(href))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // 3. Dropdown Toggle Handler
  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        if (e.target.closest('.dropdown-menu')) return;
        e.stopPropagation();
        dropdown.classList.toggle('active');
      });
    }
  });

  document.addEventListener('click', (e) => {
    dropdowns.forEach(dropdown => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });
  });

  // 4. Scroll-Driven Reveal Animations (IntersectionObserver)
  const revealElements = document.querySelectorAll('.reveal');
  const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => revealObserver.observe(el));

  // 5. Process Roadmap Progress Line Fill
  const processSection = document.getElementById('processSection');
  const processLineFill = document.getElementById('processLineFill');

  if (processSection && processLineFill) {
    window.addEventListener('scroll', () => {
      const rect = processSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      if (rect.top < windowHeight && rect.bottom > 0) {
        const totalHeight = rect.height;
        const progress = Math.min(100, Math.max(0, ((windowHeight - rect.top) / (totalHeight + windowHeight / 2)) * 100));
        processLineFill.style.width = `${progress}%`;
      }
    });
  }

  // 6. Animated Stat Counters
  const statNumbers = document.querySelectorAll('.stat-number');
  let counted = false;

  const statsSection = document.getElementById('statsBanner');
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !counted) {
        counted = true;
        statNumbers.forEach(stat => {
          const target = parseInt(stat.getAttribute('data-target'));
          const suffix = stat.getAttribute('data-suffix') || '';
          let count = 0;

          const updateCount = () => {
            const increment = Math.ceil(target / 40);
            if (count < target) {
              count = Math.min(target, count + increment);
              stat.innerText = count + suffix;
              setTimeout(updateCount, 40);
            } else {
              stat.innerText = target + suffix;
            }
          };
          updateCount();
        });
      }
    }, { threshold: 0.3 });
    statsObserver.observe(statsSection);
  }

  // 7. FAQ Accordion Toggle
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // 8. Dual-Lead Funnel Modal Logic (Buy vs Sell)
  const modalOverlay = document.getElementById('leadModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalSub = document.getElementById('modalSub');
  const buyTab = document.getElementById('buyTab');
  const sellTab = document.getElementById('sellTab');
  const buyerForm = document.getElementById('buyerForm');
  const sellerForm = document.getElementById('sellerForm');
  const formSuccess = document.getElementById('formSuccess');
  const closeModalBtn = document.getElementById('closeModalBtn');

  window.openModal = function(type) {
    if (!modalOverlay) return;
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    formSuccess.style.display = 'none';
    
    if (type === 'sell') {
      switchTab('sell');
    } else {
      switchTab('buy');
    }
  };

  window.closeModal = function() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
  };

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  function switchTab(mode) {
    if (mode === 'sell') {
      sellTab.classList.add('active');
      buyTab.classList.remove('active');
      sellerForm.style.display = 'grid';
      buyerForm.style.display = 'none';
      modalTitle.innerText = 'Looking to Sell Land in Kutch?';
      modalSub.innerText = 'Get a free valuation and connect with serious commercial buyers.';
    } else {
      buyTab.classList.add('active');
      sellTab.classList.remove('active');
      buyerForm.style.display = 'grid';
      sellerForm.style.display = 'none';
      modalTitle.innerText = 'Looking to Buy Land in Kutch?';
      modalSub.innerText = 'Access verified GIDC, NA, and Port-adjacent commercial plots.';
    }
  }

  if (buyTab) buyTab.addEventListener('click', () => switchTab('buy'));
  if (sellTab) sellTab.addEventListener('click', () => switchTab('sell'));

  if (buyerForm) {
    buyerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const newInquiry = {
        type: 'buy',
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        name: buyerForm.querySelector('input[placeholder="Your Name"]').value,
        phone: buyerForm.querySelector('input[placeholder="+91 XXXXX XXXXX"]').value,
        location: buyerForm.querySelector('select.form-select').value,
        landType: buyerForm.querySelectorAll('select.form-select')[1].value,
        area: buyerForm.querySelector('input[placeholder*="Acres"]').value
      };

      const inquiries = JSON.parse(localStorage.getItem('lead_inquiries')) || [];
      inquiries.push(newInquiry);
      localStorage.setItem('lead_inquiries', JSON.stringify(inquiries));

      buyerForm.style.display = 'none';
      formSuccess.style.display = 'block';
    });
  }

  if (sellerForm) {
    sellerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const newInquiry = {
        type: 'sell',
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        name: sellerForm.querySelector('input[placeholder="Your Full Name"]').value,
        phone: sellerForm.querySelector('input[placeholder="+91 XXXXX XXXXX"]').value,
        location: sellerForm.querySelector('input[placeholder*="Kandla Port"]').value,
        landType: sellerForm.querySelector('select.form-select').value,
        area: sellerForm.querySelector('input[placeholder*="12 Acres"]').value
      };

      const inquiries = JSON.parse(localStorage.getItem('lead_inquiries')) || [];
      inquiries.push(newInquiry);
      localStorage.setItem('lead_inquiries', JSON.stringify(inquiries));

      sellerForm.style.display = 'none';
      formSuccess.style.display = 'block';
    });
  }

  // 9. Language Switcher (EN vs GUJ)
  const langBtns = document.querySelectorAll('.lang-btn');
  const i18nElements = document.querySelectorAll('[data-i18n]');

  const dictionary = {
    en: {
      hero_title: 'Your Premier Partner for <span>Rental Commercial Properties</span> in Gandhidham & Adipur',
      hero_sub: 'Expert guidance for renting, leasing, buying, and listing commercial shops, corporate offices, showrooms, and commercial plots.',
      buy_btn: 'Looking for Rental Commercial Space?',
      sell_btn: 'Rent Out / List Your Property',
      industries_title: 'Gandhidham & Adipur Commercial Categories',
      process_title: 'Our Proven 5-Step Leasing & Buying Process'
    },
    guj: {
      hero_title: 'ગાંધીધામ અને આદિપુરમા <span>કોમર્શિયલ પ્રોપર્ટી ભાડે આપવા અને લેવા</span> માટે વિશ્વાસપાત્ર કન્સલ્ટન્ટ',
      hero_sub: 'દુકાનો, કોર્પોરેટ ઓફિસ, શોરૂમ અને કોમર્શિયલ પ્લોટ ભાડે લેવા-આપવા માટે શ્રેષ્ઠ માર્ગદર્શન.',
      buy_btn: 'કોમર્શિયલ જગ્યા ભાડે જોઈએ છે?',
      sell_btn: 'પ્રોપર્ટી ભાડે આપવી છે?',
      industries_title: 'મુખ્ય કોમર્શિયલ વિસ્તારો',
      process_title: 'અમારી ૫-પગલાની પ્રક્રિયા'
    }
  };

  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const lang = btn.getAttribute('data-lang');
      
      i18nElements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dictionary[lang] && dictionary[lang][key]) {
          el.innerHTML = dictionary[lang][key];
        }
      });
    });
  });

  // 10. Admin Content Dynamic Loading & Rendering
  const defaultSiteContent = {
    home: {
      heroTitle: "Your Premier Partner for <span>Rental Commercial Properties</span> in Gandhidham & Adipur",
      heroSubtitle: "Expert guidance for renting, leasing, buying, and listing commercial shops, corporate offices, showrooms, and commercial plots across Gandhidham & Adipur, Gujarat.",
      contactPhone: "+91 70162 70941",
      contactEmail: "shreejirealestate@gmail.com",
      storyHeadline: "Shreeji Real Estate Consultancy",
      storyParagraph: "Shreeji Real Estate is your dedicated commercial property & rental consultancy headquartered in Gandhidham, Kutch, Gujarat. With 10+ years of local market leadership, we connect business owners, retail brands, and corporate tenants with top commercial rental spaces, offices, and plots in Gandhidham and Adipur.",
      statYears: "10+ Years",
      statAcres: "250+ Spaces",
      statClients: "100+ Clients"
    },
    gandhidham: {
      heroBadge: "Gandhidham Commercial Hub",
      heroTitle: "Rental Commercial Properties in <span>Gandhidham</span>",
      heroSubtitle: "Explore top rental shops, corporate office spaces, retail showrooms, and commercial lease plots along Tagor Road, Main Market, and Sector 1-12 in Gandhidham.",
      adv1Title: "Tagore Road Commercial Sector",
      adv1Desc: "High-demand corporate office buildings and furnished commercial suites with 24/7 power backup and elevator access.",
      adv2Title: "Main Market Retail Outlets",
      adv2Desc: "Prime ground-floor shop spaces with heavy daily customer footfall ideal for retail brands, banks, and cafes.",
      adv3Title: "Commercial Plot Leasing",
      adv3Desc: "Open roadside commercial plots available on long-term lease agreements for custom commercial construction.",
      adv4Title: "Hassle-Free Lease Deeds",
      adv4Desc: "Complete legal verification, background check of tenants/landlords, and registered 11-month lease deed preparation."
    },
    adipur: {
      heroBadge: "Adipur Commercial & Retail Belt",
      heroTitle: "Commercial Properties for Rent in <span>Adipur</span>",
      heroSubtitle: "Discover high-demand retail market shops, commercial office suites, and rental showrooms near Adipur Station Road and primary commercial markets.",
      adv1Title: "Station Road Market Frontage",
      adv1Desc: "High visibility commercial shops positioned directly on Adipur's main commercial artery.",
      adv2Title: "Boutique Office Units",
      adv2Desc: "Ready-to-move-in commercial office units suitable for doctors, lawyers, accountants, and consultants.",
      adv3Title: "Retail Showrooms",
      adv3Desc: "Spacious multi-level showrooms with wide glass frontages ideal for apparel brands and electronics stores.",
      adv4Title: "Clear Property Titles",
      adv4Desc: "100% verified ownership records, commercial tax clearance, and straightforward rental agreements."
    },
    listings: [
      { id: 1, title: "1,200 Sq.Ft Furnished Office Space", location: "Tagor Road Commercial Complex, Gandhidham", tag: "Corporate Office", area: "1,200 Sq.Ft", year: "2026", details: ["Air-conditioned with 15 workstations", "Private cabin, conference room & pantry", "100% power backup & elevator access"] },
      { id: 2, title: "850 Sq.Ft Ground Floor Market Shop", location: "Main Market Road, Sector 8, Gandhidham", tag: "Retail Shop", area: "850 Sq.Ft", year: "2026", details: ["Heavy customer footfall area", "20-foot glass frontage for high brand visibility", "Suitable for retail brands, banks & cafes"] },
      { id: 3, title: "1,500 Sq.Ft Main Market Showroom", location: "Station Road Market, Adipur", tag: "Showroom", area: "1,500 Sq.Ft", year: "2026", details: ["Prime corner shop location with top visibility", "Mezzanine floor for extra storage or office", "Ready for retail, apparel & electronics"] },
      { id: 4, title: "2,500 Sq.Ft Commercial Lease Plot", location: "Gandhidham Highway Junction", tag: "Commercial Plot", area: "2,500 Sq.Ft", year: "2026", details: ["Wide road frontage for commercial display", "Available on long-term 5-year to 10-year lease", "Clear commercial municipal zoning"] }
    ],
    pdfs: []
  };

  const siteContent = JSON.parse(localStorage.getItem('site_content')) || defaultSiteContent;

  // 11. Determine Current Page Key & Apply Overrides
  const path = window.location.pathname.toLowerCase();
  let currentPageKey = null;
  if (path.includes('gandhidham')) currentPageKey = 'gandhidham';
  else if (path.includes('adipur')) currentPageKey = 'adipur';

  if (currentPageKey && siteContent[currentPageKey]) {
    const pageData = siteContent[currentPageKey];
    
    // Override Hero details for subpages
    const heroBadge = document.querySelector('.hero-badge');
    const heroTitle = document.querySelector('.hero-title');
    const heroSub = document.querySelector('.hero-subtitle');
    
    if (heroBadge && pageData.heroBadge) heroBadge.innerHTML = `<i class="fa-solid fa-anchor"></i> ${pageData.heroBadge}`;
    if (heroTitle && pageData.heroTitle) heroTitle.innerHTML = pageData.heroTitle;
    if (heroSub && pageData.heroSubtitle) heroSub.textContent = pageData.heroSubtitle;

    // Override Advantages list cards
    const advCards = document.querySelectorAll('.industries-grid .industry-card');
    if (advCards && advCards.length >= 4) {
      if (pageData.adv1Title && advCards[0].querySelector('.industry-title')) {
        advCards[0].querySelector('.industry-title').textContent = pageData.adv1Title;
      }
      if (pageData.adv1Desc && advCards[0].querySelector('.industry-desc')) {
        advCards[0].querySelector('.industry-desc').textContent = pageData.adv1Desc;
      }
      if (pageData.adv2Title && advCards[1].querySelector('.industry-title')) {
        advCards[1].querySelector('.industry-title').textContent = pageData.adv2Title;
      }
      if (pageData.adv2Desc && advCards[1].querySelector('.industry-desc')) {
        advCards[1].querySelector('.industry-desc').textContent = pageData.adv2Desc;
      }
      if (pageData.adv3Title && advCards[2].querySelector('.industry-title')) {
        advCards[2].querySelector('.industry-title').textContent = pageData.adv3Title;
      }
      if (pageData.adv3Desc && advCards[2].querySelector('.industry-desc')) {
        advCards[2].querySelector('.industry-desc').textContent = pageData.adv3Desc;
      }
      if (pageData.adv4Title && advCards[3].querySelector('.industry-title')) {
        advCards[3].querySelector('.industry-title').textContent = pageData.adv4Title;
      }
      if (pageData.adv4Desc && advCards[3].querySelector('.industry-desc')) {
        advCards[3].querySelector('.industry-desc').textContent = pageData.adv4Desc;
      }
    }
  } else {
    // Override main homepage details
    const homeData = siteContent.home || defaultSiteContent.home;
    const heroTitleEl = document.querySelector('.hero-title');
    const heroSubEl = document.querySelector('.hero-subtitle');
    if (heroTitleEl && homeData.heroTitle) {
      heroTitleEl.innerHTML = homeData.heroTitle;
    }
    if (heroSubEl && homeData.heroSubtitle) {
      heroSubEl.textContent = homeData.heroSubtitle;
    }

    // Apply Our Story overrides
    const storyHeadlineEl = document.getElementById('storyHeadlineDisplay');
    const storyParagraphEl = document.getElementById('storyParagraphDisplay');
    const storyYearsEl = document.getElementById('storyYearsDisplay');
    const storyAcresEl = document.getElementById('storyAcresDisplay');

    if (storyHeadlineEl && homeData.storyHeadline) storyHeadlineEl.textContent = homeData.storyHeadline;
    if (storyParagraphEl && homeData.storyParagraph) storyParagraphEl.textContent = homeData.storyParagraph;
    if (storyYearsEl && homeData.statYears) storyYearsEl.textContent = homeData.statYears;
    if (storyAcresEl && homeData.statAcres) storyAcresEl.textContent = homeData.statAcres;

    // Apply Stats banner dynamic numbers
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers && statNumbers.length >= 3) {
      if (homeData.statYears) {
        statNumbers[0].setAttribute('data-target', homeData.statYears.replace(/\D/g, '') || "10");
        statNumbers[0].setAttribute('data-suffix', homeData.statYears.replace(/\d/g, '') || "+");
      }
      if (homeData.statAcres) {
        statNumbers[1].setAttribute('data-target', homeData.statAcres.replace(/\D/g, '') || "500");
        statNumbers[1].setAttribute('data-suffix', homeData.statAcres.replace(/\d/g, '') || "+");
      }
      if (homeData.statClients) {
        statNumbers[2].setAttribute('data-target', homeData.statClients.replace(/\D/g, '') || "100");
        statNumbers[2].setAttribute('data-suffix', homeData.statClients.replace(/\d/g, '') || "+");
      }
    }

    // Apply contact details overrides
    const footerPhoneEl = document.querySelector('.footer-links i.fa-phone');
    const footerEmailEl = document.querySelector('.footer-links i.fa-envelope');
    if (footerPhoneEl && homeData.contactPhone) {
      footerPhoneEl.parentElement.innerHTML = `<i class="fa-solid fa-phone" style="color: var(--accent-gold); margin-right: 0.5rem;"></i> ${homeData.contactPhone}`;
    }
    if (footerEmailEl && homeData.contactEmail) {
      footerEmailEl.parentElement.innerHTML = `<i class="fa-solid fa-envelope" style="color: var(--accent-gold); margin-right: 0.5rem;"></i> ${homeData.contactEmail}`;
    }
  }

  // Populate dynamic land listings if container exists
  const dynamicListingsContainer = document.getElementById('dynamicListingsContainer');
  if (dynamicListingsContainer && siteContent.listings) {
    dynamicListingsContainer.innerHTML = '';
    
    // Filter listings relevant to subpage if applicable
    let listingsToRender = siteContent.listings;
    if (currentPageKey === 'kandla') {
      listingsToRender = siteContent.listings.filter(l => l.location.toLowerCase().includes('kandla') || l.location.toLowerCase().includes('tuna'));
    } else if (currentPageKey === 'mundra') {
      listingsToRender = siteContent.listings.filter(l => l.location.toLowerCase().includes('mundra'));
    } else if (currentPageKey === 'khavda') {
      listingsToRender = siteContent.listings.filter(l => l.location.toLowerCase().includes('khavda'));
    } else if (currentPageKey === 'gidc') {
      listingsToRender = siteContent.listings.filter(l => l.location.toLowerCase().includes('gidc') || l.location.toLowerCase().includes('estates'));
    } else if (currentPageKey === 'dholavira') {
      listingsToRender = siteContent.listings.filter(l => l.location.toLowerCase().includes('dholavira'));
    }

    listingsToRender.forEach(listing => {
      const card = document.createElement('div');
      card.className = 'service-card reveal active';
      card.style.borderTop = '6px solid var(--accent-gold)';
      card.innerHTML = `
        <div class="tag" style="background: var(--primary); color: white; margin-bottom: 1rem;">${listing.tag}</div>
        <h3 style="font-size: 1.4rem; margin-bottom: 0.5rem; color: var(--primary-dark); font-weight: 700;">${listing.title}</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">
          <i class="fa-solid fa-location-dot" style="color: var(--accent-gold);"></i> ${listing.location}
        </p>
        <ul class="service-list" style="margin-bottom: 1.5rem;">
          ${listing.details.map(detail => `<li><i class="fa-solid fa-circle-check" style="color: var(--accent-emerald);"></i> ${detail}</li>`).join('')}
        </ul>
        <button class="btn btn-primary" onclick="openModal('buy')" style="width: 100%; margin-top: auto;">Request Details</button>
      `;
      dynamicListingsContainer.appendChild(card);
    });
  }

  // Admin access validation for floating badge and PDF downloads vault
  const isAdmin = sessionStorage.getItem('admin_logged') === 'true';
  if (isAdmin) {
    const floatingBtn = document.getElementById('floatingAdminBtn');
    if (floatingBtn) floatingBtn.style.display = 'flex';

    const adminPdfVault = document.getElementById('adminPdfVault');
    const vaultPdfContainer = document.getElementById('vaultPdfContainer');

    if (adminPdfVault && vaultPdfContainer) {
      adminPdfVault.style.display = 'block';
      vaultPdfContainer.innerHTML = '';

      if (!siteContent.pdfs || siteContent.pdfs.length === 0) {
        vaultPdfContainer.innerHTML = `<p style="color: rgba(255,255,255,0.7); grid-column: span 3; text-align: center; padding: 2rem;">No documents uploaded in the vault yet.</p>`;
      } else {
        siteContent.pdfs.forEach(pdf => {
          const card = document.createElement('div');
          card.className = 'service-card active';
          card.style.background = 'rgba(255, 255, 255, 0.08)';
          card.style.border = '1px solid rgba(255, 255, 255, 0.15)';
          card.style.color = 'white';
          card.innerHTML = `
            <div style="font-size: 2.5rem; color: #EF4444; margin-bottom: 1rem;"><i class="fa-solid fa-file-pdf"></i></div>
            <h3 style="color: white; font-size: 1.2rem; margin-bottom: 0.5rem;">${pdf.name}</h3>
            <p style="color: rgba(255,255,255,0.6); font-size: 0.8rem; margin-bottom: 1.5rem;">Size: ${pdf.size} | Uploaded: ${pdf.date}</p>
            <a href="${pdf.data}" download="${pdf.name}" class="btn btn-secondary" style="width: 100%; text-decoration: none;"><i class="fa-solid fa-download"></i> Download PDF</a>
          `;
          vaultPdfContainer.appendChild(card);
        });
      }
    }
  }
});
