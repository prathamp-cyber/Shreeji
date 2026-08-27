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

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      if (navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
      } else {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '80px';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = '#FFFFFF';
        navLinks.style.padding = '2rem';
        navLinks.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
      }
    });
  }

  // 2. Clean Routing & Section Scroll (HTML5 History API)
  const routeMap = {
    '/overview': 'overview',
    '/industries': 'industries',
    '/services': 'services',
    '/process': 'process',
    '/faq': 'faq',
    '/home': 'home'
  };

  function navigateToSection(path, isInitial = false) {
    const sectionId = routeMap[path];
    const targetSection = sectionId ? document.getElementById(sectionId) : null;

    if (targetSection) {
      const headerOffset = 80;
      const elementPosition = targetSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: isInitial ? 'auto' : 'smooth'
      });
      
      if (!isInitial) {
        history.pushState(null, '', path);
      }
      updateActiveNavLink(path);
    } else if (path === '/' || path === '/home') {
      window.scrollTo({ top: 0, behavior: isInitial ? 'auto' : 'smooth' });
      if (!isInitial) history.pushState(null, '', '/');
      updateActiveNavLink('/');
    }
  }

  function updateActiveNavLink(path) {
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === path || (path === '/' && href === '/')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Intercept nav links for smooth single-page clean routing
  document.querySelectorAll('a[href^="/"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href in routeMap || href === '/') {
        e.preventDefault();
        navigateToSection(href);
        if (window.innerWidth <= 768 && navLinks) {
          navLinks.style.display = 'none';
        }
      }
    });
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
      hero_title: 'Your Trusted Land Consultant for <span>Commercial & Industrial Land</span> in Kutch',
      hero_sub: 'Expert guidance for strategic land acquisition and sales near Kandla, Mundra, Tuna Ports & Dholavira SEZ.',
      buy_btn: 'Looking to Buy Land?',
      sell_btn: 'Looking to Sell Land?',
      industries_title: 'Industries We Specialize In',
      process_title: 'Our Proven 5-Step Process'
    },
    guj: {
      hero_title: 'કચ્છમાં <span>વાણિજ્યિક અને ઔદ્યોગિક જમીન</span> માટે તમારા વિશ્વસનીય કન્સલ્ટન્ટ',
      hero_sub: 'કાંડલા, મુન્દ્રા, ટૂના પોર્ટ અને ધોળાવીરા નજીક જમીન ખરીદ-વેચાણ માટે નિષ્ણાત માર્ગદર્શન.',
      buy_btn: 'જમીન ખરીદવી છે?',
      sell_btn: 'જમીન વેચવી છે?',
      industries_title: 'મુખ્ય ઔદ્યોગિક ક્ષેત્રો',
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
      heroTitle: "Your Trusted Land Consultant for <span>Commercial & Industrial Land</span> in Kutch",
      heroSubtitle: "Expert guidance for strategic land transactions near Kandla, Mundra, Tuna Ports & Dholavira UNESCO Site. Specializing in Gandhidham, Anjar, Bhuj & GIDC estates.",
      contactPhone: "+91 70162 70941",
      contactEmail: "landinkutch@gmail.com",
      storyHeadline: "Who We Are",
      storyParagraph: "LandInKutch is your trusted land consultant for strategic land transactions in Kutch's port corridor. With 10+ years of experience and deep market knowledge, we facilitate successful land deals between serious buyers and sellers through our proven consultancy process.",
      statYears: "10+ Years",
      statAcres: "500+ Acres",
      statClients: "100+ Clients"
    },
    kandla: {
      heroBadge: "Maritime & Logistics Hub",
      heroTitle: "Commercial Land in <span>Kandla Port Corridor</span>",
      heroSubtitle: "Prime warehousing, container freight station (CFS), and cold storage plots situated adjacent to Deendayal Port Trust (DPT) & Kandla-Gandhidham highway.",
      adv1Title: "Major Port Gate Proximity",
      adv1Desc: "Plots located within 5 km to 15 km of Kandla Port docks, drastically reducing drayage and container transport costs.",
      adv2Title: "Highway Connectivity",
      adv2Desc: "Direct 4-lane access to NH-41 connecting Gandhidham, Ahmedabad, and major inland container depots (ICDs).",
      adv3Title: "High Industrial Power",
      adv3Desc: "Continuous 66kV and 11kV substation feeder lines specifically configured for heavy warehousing and cold chains.",
      adv4Title: "Clear NA Status",
      adv4Desc: "Verified non-agricultural commercial zoning suitable for logistics parks, liquid tank farms, and godowns."
    },
    mundra: {
      heroBadge: "Global Trade Gateway",
      heroTitle: "Industrial Land in <span>Mundra SEZ & Port</span>",
      heroSubtitle: "Prime industrial land, heavy manufacturing zones, and logistics terminal plots inside or adjacent to India's largest private port and Special Economic Zone.",
      adv1Title: "SEZ Tax Incentives",
      adv1Desc: "Duty-free import, single-window clearances, and long-term corporate tax exemptions inside the Mundra SEZ territory.",
      adv2Title: "Deep Water Port Access",
      adv2Desc: "Seamless integration with Mundra Port's container terminals, bulk cargo berths, and dedicated railway lines.",
      adv3Title: "Co-Location Benefits",
      adv3Desc: "Proximity to power plants, steel mills, and petrochemical giants offering direct raw material supply chains.",
      adv4Title: "Robust Infrastructure",
      adv4Desc: "High-capacity gas pipelines, high-speed fiber networks, and chemical-grade industrial drainage systems."
    },
    khavda: {
      heroBadge: "Green Energy Corridor",
      heroTitle: "Utility-Scale Land in <span>Khavda Solar Park</span>",
      heroSubtitle: "Strategic land bank availability suitable for massive wind-solar hybrid projects, private solar farms, and green hydrogen initiatives.",
      adv1Title: "Highest Solar Radiation",
      adv1Desc: "Kutch's desert zones offer the highest solar irradiance and constant wind velocities in the country.",
      adv2Title: "Power Grid Integration",
      adv2Desc: "Proximity to national grid evacuation lines and high-voltage substations for immediate power transfer.",
      adv3Title: "Aggregated Clean Titles",
      adv3Desc: "Duly scouted, surveyed, and boundary-marked government-approved lease plots ready for project setup.",
      adv4Title: "High Returns on Lease",
      adv4Desc: "Long-term revenue yield model with stable corporate power purchasing agreements (PPAs)."
    },
    gidc: {
      heroBadge: "Structured Manufacturing Zone",
      heroTitle: "Plots in <span>GIDC Industrial Estates</span>",
      heroSubtitle: "Acquire pre-cleared industrial plots in Gandhidham, Anjar, Kidana, and Bhuj GIDC estates equipped with industrial amenities.",
      adv1Title: "Plug & Play Plots",
      adv1Desc: "Ready concrete boundary plots with internal asphalt roads, high-tension power, and centralized sewage systems.",
      adv2Title: "Fast-Track Approval",
      adv2Desc: "Simplified factory license registry and streamlined local municipal clearance mechanisms.",
      adv3Title: "Skilled Labor Pool",
      adv3Desc: "Located near dense residential hubs in Gandhidham and Anjar, guaranteeing easy access to industrial labor.",
      adv4Title: "Zoning Permissions",
      adv4Desc: "Duly certified zones for chemicals, engineering, wood-crafting, mineral-processing, and heavy fabrication."
    },
    dholavira: {
      heroBadge: "Heritage & Tourism Belt",
      heroTitle: "Resort Land in <span>Dholavira Tourism Zone</span>",
      heroSubtitle: "Invest in commercial hospitality and resort plots near the UNESCO World Heritage site and the scenic Road to Heaven.",
      adv1Title: "UNESCO Tourism Boom",
      adv1Desc: "Massive inflow of domestic and international cultural tourists visiting the ancient Harappan civilization site.",
      adv2Title: "Scenic Highway Frontage",
      adv2Desc: "Plots positioned directly on the new 4-lane Highway connecting Dholavira with the Great Rann of Kutch.",
      adv3Title: "Hospitality Zoning",
      adv3Desc: "Zoned specifically for eco-resorts, heritage hotels, luxury tents, and tourist amenities centers.",
      adv4Title: "Unique Landscape Appeal",
      adv4Desc: "Breathtaking views of the salt desert flats combined with pristine local wildlife ecosystems."
    },
    listings: [
      { id: 1, title: "12.5 Acres NA Commercial Plot", location: "Kandla Port Corridor", tag: "Logistics Park Plot", area: "12.5 Acres", year: "2025", details: ["100% NA & Title Clear (single owner)", "Wide 60-meter highway frontage"] },
      { id: 2, title: "5.2 Acres Industrial Plot", location: "Tuna Port Corridor", tag: "Warehouse & Storage", area: "5.2 Acres", year: "2024", details: ["Pre-approved industrial zoning", "Water & power connection ready"] },
      { id: 3, title: "15.0 Acres Manufacturing Land", location: "GIDC Industrial Estates", tag: "Heavy Manufacturing", area: "15.0 Acres", year: "2025", details: ["Ready concrete boundary plots", "Centralized sewage systems"] },
      { id: 4, title: "20.0 Acres Renewable Plot", location: "Khavda Solar Park", tag: "Solar Installation", area: "20.0 Acres", year: "2025", details: ["Proximity to evacuation lines", "Scouted and boundary marked"] }
    ],
    pdfs: []
  };

  const siteContent = JSON.parse(localStorage.getItem('site_content')) || defaultSiteContent;

  // 11. Determine Current Page Key & Apply Overrides
  const path = window.location.pathname.toLowerCase();
  let currentPageKey = null;
  if (path.includes('kandla-port')) currentPageKey = 'kandla';
  else if (path.includes('mundra-sez')) currentPageKey = 'mundra';
  else if (path.includes('khavda-solar')) currentPageKey = 'khavda';
  else if (path.includes('gidc-estates')) currentPageKey = 'gidc';
  else if (path.includes('dholavira-tourism')) currentPageKey = 'dholavira';

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
