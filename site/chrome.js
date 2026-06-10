// chrome.js — shared site chrome for withorca.com.
// Injects the icon sprite, the sticky top nav (+ mobile menu) and the footer
// into every page, so the markup lives in one place. Page-specific content
// stays in each page's own HTML. No framework / build step.

(function () {
  /* ---------------------------------------------------------------- */
  /* Icon sprite (thin single-weight line style — Lucide-like).        */
  /* Production should swap to the Lucide icon set per the spec.        */
  /* ---------------------------------------------------------------- */
  var SPRITE = '' +
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
    '<symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></symbol>' +
    '<symbol id="i-arrowDown" viewBox="0 0 24 24"><path d="M12 5v13M6 12l6 6 6-6"/></symbol>' +
    '<symbol id="i-check" viewBox="0 0 24 24"><path d="M20 6L9 17l-4.5-4.5"/></symbol>' +
    '<symbol id="i-play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></symbol>' +
    '<symbol id="i-chevron" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></symbol>' +
    '<symbol id="i-chevronR" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></symbol>' +
    '<symbol id="i-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></symbol>' +
    '<symbol id="i-chart" viewBox="0 0 24 24"><path d="M4 20V8M10 20V4M16 20v-7M22 20H2"/></symbol>' +
    '<symbol id="i-list" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></symbol>' +
    '<symbol id="i-doc" viewBox="0 0 24 24"><path d="M14 3v5h5M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/></symbol>' +
    '<symbol id="i-folder" viewBox="0 0 24 24"><path d="M3 7a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/></symbol>' +
    '<symbol id="i-todo" viewBox="0 0 24 24"><path d="M9 11l3 3 8-8M21 12v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h11"/></symbol>' +
    '<symbol id="i-spark" viewBox="0 0 24 24"><path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l4.2 4.2M14.2 14.2l4.2 4.2M18.4 5.6l-4.2 4.2M9.8 14.2l-4.2 4.2"/></symbol>' +
    '<symbol id="i-radar" viewBox="0 0 24 24"><path d="M12 12a8 8 0 1 0 6 2.7M12 12l6-6M12 12V4"/></symbol>' +
    '<symbol id="i-upload" viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5M5 20h14"/></symbol>' +
    '<symbol id="i-merge" viewBox="0 0 24 24"><path d="M7 21V11l-4 4M7 11l4 4M17 3v10l4-4M17 13l-4-4"/></symbol>' +
    '<symbol id="i-share" viewBox="0 0 24 24"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13"/></symbol>' +
    '<symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 21.5s7-3.5 7-9V5.2L12 2.6 5 5.2V12.5c0 5.5 7 9 7 9z"/></symbol>' +
    '<symbol id="i-lock" viewBox="0 0 24 24"><path d="M6 11V8a6 6 0 0 1 12 0v3M5 11h14v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z"/></symbol>' +
    '<symbol id="i-layers" viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5"/></symbol>' +
    '<symbol id="i-users" viewBox="0 0 24 24"><path d="M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM22 20v-2a4 4 0 0 0-3-3.87M16 4.13a4 4 0 0 1 0 7.75"/></symbol>' +
    '<symbol id="i-building" viewBox="0 0 24 24"><path d="M5 21V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v17M15 9h3a1 1 0 0 1 1 1v11M3 21h18M8 7h0M11 7h0M8 11h0M11 11h0M8 15h3"/></symbol>' +
    '<symbol id="i-landmark" viewBox="0 0 24 24"><path d="M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M3 10l9-6 9 6"/></symbol>' +
    '<symbol id="i-scale" viewBox="0 0 24 24"><path d="M12 3v18M6 21h12M4 8h16M7 8l-3 6.5a3 3 0 0 0 6 0L7 8zM17 8l-3 6.5a3 3 0 0 0 6 0L17 8z"/></symbol>' +
    '<symbol id="i-trend" viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 7-7M15 8h6v6"/></symbol>' +
    '<symbol id="i-image" viewBox="0 0 24 24"><path d="M3 5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM3 16l5-5 4 4 3-3 6 6M9 9a1.5 1.5 0 1 0 0 .01"/></symbol>' +
    '<symbol id="i-film" viewBox="0 0 24 24"><path d="M3 4h18v16H3zM7 4v16M17 4v16M3 9h4M3 14h4M17 9h4M17 14h4"/></symbol>' +
    '<symbol id="i-menu" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></symbol>' +
    '<symbol id="i-key" viewBox="0 0 24 24"><path d="M14 7a4 4 0 1 1-5.2 5.2L3 18v3h3l5.8-5.8A4 4 0 0 1 14 7zM15.5 8.5h.01"/></symbol>' +
    '<symbol id="i-swap" viewBox="0 0 24 24"><path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/></symbol>' +
    '<symbol id="i-filter" viewBox="0 0 24 24"><path d="M3 5h18l-7 8v6l-4-2v-4z"/></symbol>' +
    '</defs></svg>';

  function ic(name, size, extra) {
    return '<svg class="ic' + (extra ? ' ' + extra : '') + '" width="' + size + '" height="' + size + '"><use href="#i-' + name + '"/></svg>';
  }

  var NAV =
    '<header class="nav">' +
      '<div class="wrap nav__bar">' +
        '<a href="index.html" class="nav__brand"><img src="assets/orca-symbol-black.png" alt="ORCA" /><span class="orca-wordmark">ORCA</span></a>' +
        '<nav class="nav__menu">' +
          /* Platform */
          '<div class="nav__item"><a href="platform.html">Platform ' + ic('chevron', 13, 'chev') + '</a>' +
            '<div class="nav__pop"><div class="mega" style="width:612px">' +
              '<div class="mega__cols" style="grid-template-columns:repeat(2,1fr)">' +
                '<div><div class="mega__head">The engine</div><div class="mega__list">' +
                  megaItem('platform.html#engine', 'radar', 'Document-to-truth', "Legal documents become a verified source of truth.") +
                  megaItem('platform.html#consolidate', 'layers', 'Consolidate', 'Every entity, owner and asset in one live model.') +
                  megaItem('platform.html#reconcile', 'check', 'Reconcile &amp; check', "ORCA flags what's missing and assigns the fix.") +
                  megaItem('platform.html#share', 'share', 'Share &amp; collaborate', 'Share fast, stay safe — you keep control.') +
                '</div></div>' +
                '<div><div class="mega__head">Experience it</div><div class="mega__list">' +
                  megaItem('index.html#sonar', 'spark', 'Interactive Sonar', 'Watch a document become a structure chart.') +
                  megaItem('watch-demo.html', 'play', 'Watch a demo', '90-sec teaser or the full chaptered tour.', true) +
                  megaItem('platform.html#levels', 'trend', 'The 4 Levels', 'Where does your setup sit today?') +
                '</div></div>' +
              '</div>' +
              megaFeature('book-demo.html', 'See it on your own structure', '20 minutes, with a human.', 'Book a demo') +
            '</div></div>' +
          '</div>' +
          /* Solutions */
          '<div class="nav__item"><a href="solutions.html">Solutions ' + ic('chevron', 13, 'chev') + '</a>' +
            '<div class="nav__pop"><div class="mega" style="width:820px">' +
              '<div class="mega__cols" style="grid-template-columns:repeat(3,1fr)">' +
                '<div><div class="mega__head">By who you are</div><div class="mega__list">' +
                  megaItem('segment.html', 'users', 'Family Offices', 'Beneficial owners, trusts, succession.') +
                  megaItem('solutions.html#pe', 'trend', 'PE &amp; Investment', 'Funds, SPVs and holdings on one map.') +
                  megaItem('solutions.html#re', 'building', 'Real Estate', 'Property-holding structures, kept current.') +
                  megaItem('solutions.html#corp', 'landmark', 'Operating Companies', 'Every subsidiary and shareholding, live.') +
                '</div></div>' +
                '<div><div class="mega__head">Also serving</div><div class="mega__list">' +
                  megaItem('solutions.html#law', 'scale', 'Law &amp; Trust Firms', 'Hundreds of client structures, one system.') +
                  megaItem('solutions.html#advisors', 'key', 'Advisors &amp; Wealth', 'From data room to chart in minutes.') +
                '</div></div>' +
                '<div><div class="mega__head">By need</div><div class="mega__list">' +
                  megaItem('solutions.html#by-need', 'chart', 'Structure charts') +
                  megaItem('solutions.html#by-need', 'shield', 'KYC / AML') +
                  megaItem('solutions.html#by-need', 'users', 'Succession') +
                  megaItem('solutions.html#by-need', 'swap', 'Exit &amp; due diligence') +
                  megaItem('solutions.html#by-need', 'folder', 'Document management') +
                '</div></div>' +
              '</div>' +
              megaFeature('solutions.html#by-need', 'Not sure where you fit?', "Browse by need — we'll help you map it.", 'Explore solutions') +
            '</div></div>' +
          '</div>' +
          /* Why ORCA */
          '<div class="nav__item"><a href="why-orca.html">Why ORCA ' + ic('chevron', 13, 'chev') + '</a>' +
            '<div class="nav__pop"><div class="mega" style="width:460px">' +
              '<div class="mega__cols" style="grid-template-columns:repeat(1,1fr)">' +
                '<div><div class="mega__head">The case for ORCA</div><div class="mega__list">' +
                  megaItem('why-orca.html#moat', 'radar', 'Document-to-truth moat', 'Why ORCA is hard to copy.') +
                  megaItem('why-orca.html#own', 'key', 'Own your information', 'Your data, your control — always.') +
                  megaItem('why-orca.html#security', 'lock', 'Security &amp; privacy', 'Swiss, zero-knowledge, 256-bit.') +
                  megaItem('why-orca.html#compare', 'scale', 'vs. the alternatives', 'An honest comparison.') +
                '</div></div>' +
              '</div>' +
              megaFeature('book-demo.html', 'One product, better for everyone', 'See the difference live.', 'Book a demo') +
            '</div></div>' +
          '</div>' +
          '<a href="customers.html" class="nav__link">Customers</a>' +
          '<a href="#" class="nav__link">Resources</a>' +
        '</nav>' +
        '<div class="nav__actions">' +
          '<a href="#" class="nav__login nav-link">Log in</a>' +
          '<a href="watch-demo.html" class="btn btn--outline">Watch a demo</a>' +
          '<a href="book-demo.html" class="btn btn--primary">Book a demo ' + ic('arrow', 15) + '</a>' +
        '</div>' +
        '<button class="nav__burger" id="burger" aria-label="Menu" aria-expanded="false">' + ic('menu', 20) + '</button>' +
      '</div>' +
    '</header>';

  // Mobile menu lives OUTSIDE the header: the header has backdrop-filter, which
  // would otherwise trap this position:fixed panel and collapse it to content height.
  var MOBILE_MENU =
      '<div class="mobile-menu" id="mobileMenu"><div class="wrap">' +
        mobileSec('Platform', [
          ['The engine', [['platform.html#engine','radar','Document-to-truth'],['platform.html#consolidate','layers','Consolidate'],['platform.html#reconcile','check','Reconcile &amp; check'],['platform.html#share','share','Share &amp; collaborate']]],
          ['Experience it', [['index.html#sonar','spark','Interactive Sonar'],['watch-demo.html','play','Watch a demo'],['platform.html#levels','trend','The 4 Levels']]],
        ]) +
        mobileSec('Solutions', [
          ['By who you are', [['segment.html','users','Family Offices'],['solutions.html#pe','trend','PE &amp; Investment'],['solutions.html#re','building','Real Estate'],['solutions.html#corp','landmark','Operating Companies']]],
          ['Also serving', [['solutions.html#law','scale','Law &amp; Trust Firms'],['solutions.html#advisors','key','Advisors &amp; Wealth']]],
        ]) +
        mobileSec('Why ORCA', [
          ['The case for ORCA', [['why-orca.html#moat','radar','Document-to-truth moat'],['why-orca.html#own','key','Own your information'],['why-orca.html#security','lock','Security &amp; privacy'],['why-orca.html#compare','scale','vs. the alternatives']]],
        ]) +
        '<a href="customers.html" class="mobile-flat">Customers</a>' +
        '<a href="#" class="mobile-flat">Resources</a>' +
        '<div class="mobile-cta">' +
          '<a href="watch-demo.html" class="btn btn--outline btn--big">Watch a demo</a>' +
          '<a href="book-demo.html" class="btn btn--primary btn--big">Book a demo ' + ic('arrow', 17) + '</a>' +
          '<a href="#" class="login">Log in →</a>' +
        '</div>' +
      '</div></div>';

  function megaItem(href, icon, label, blurb, fill) {
    return '<a href="' + href + '" class="mega-item"><span class="chip">' + ic(icon, 15, fill ? 'ic--fill' : '') + '</span>' +
      '<span class="txt' + (blurb ? '' : ' txt--noblurb') + '"><span class="lbl">' + label + '</span>' +
      (blurb ? '<span class="blurb">' + blurb + '</span>' : '') + '</span></a>';
  }
  function megaFeature(href, title, body, cta) {
    return '<a href="' + href + '" class="mega__feature card-hover"><img src="assets/orca-symbol-white.png" alt="" />' +
      '<div class="ft-title">' + title + '</div><div class="ft-body">' + body + '</div>' +
      '<span class="ft-cta">' + cta + ' ' + ic('arrow', 13) + '</span></a>';
  }
  function mobileSec(name, cols) {
    var inner = cols.map(function (c) {
      return '<div class="mobile-col"><div class="h">' + c[0] + '</div>' +
        c[1].map(function (it) {
          return '<a href="' + it[0] + '" class="mobile-link">' + ic(it[1], 16, it[1] === 'play' ? 'ic--fill' : '') + ' ' + it[2] + '</a>';
        }).join('') + '</div>';
    }).join('');
    return '<details class="mobile-sec"><summary>' + name + ' ' + ic('chevron', 16, 'chev') + '</summary>' + inner + '</details>';
  }

  var FOOTER =
    '<footer class="footer">' +
      '<div class="wrap footer__grid">' +
        '<div><div class="footer__brand"><img src="assets/orca-symbol-white.png" alt="" /><span class="orca-wordmark">ORCA</span></div>' +
          '<div class="footer__blurb">The easiest, fastest, most intelligent and secure way to store, manage, analyze and share your legal information.</div>' +
          '<div class="footer__tag">#getorcanized</div></div>' +
        footCol('Platform', [['platform.html','Document-to-truth'],['platform.html','Consolidate'],['platform.html','Reconcile &amp; check'],['platform.html','Share &amp; collaborate'],['platform.html','The 4 Levels']]) +
        footCol('Solutions', [['segment.html','Family Offices'],['solutions.html','PE &amp; Investment'],['solutions.html','Real Estate'],['solutions.html','Operating Companies'],['solutions.html','Law &amp; Trust'],['solutions.html','Advisors']]) +
        footCol('Company', [['why-orca.html','Why ORCA'],['customers.html','Customers'],['#','Resources'],['watch-demo.html','Watch a demo'],['#','Log in']]) +
      '</div>' +
      '<div class="footer__bar"><div class="wrap row">' +
        '<span>© 2026 ORCA AG · Zug, Switzerland</span>' +
        '<span>Swiss data centres · 256-bit encryption · zero-knowledge · GDPR</span>' +
      '</div></div>' +
    '</footer>';

  function footCol(h, links) {
    return '<div class="footer__col"><div class="h">' + h + '</div><div class="links">' +
      links.map(function (l) { return '<a href="' + l[0] + '" class="foot-link">' + l[1] + '</a>'; }).join('') +
      '</div></div>';
  }

  /* ---------------------------------------------------------------- */
  /* Mount                                                             */
  /* ---------------------------------------------------------------- */
  function mount() {
    document.body.insertAdjacentHTML('afterbegin', SPRITE);
    var navSlot = document.getElementById('site-nav');
    var footSlot = document.getElementById('site-footer');
    if (navSlot) navSlot.outerHTML = NAV;
    if (footSlot) footSlot.outerHTML = FOOTER;

    // mobile menu appended to body (not inside the backdrop-filtered header)
    document.body.insertAdjacentHTML('beforeend', MOBILE_MENU);

    wireEmbeds();

    // burger toggle
    var burger = document.getElementById('burger');
    var menu = document.getElementById('mobileMenu');
    if (burger && menu) {
      var iconUse = burger.querySelector('use');
      burger.addEventListener('click', function () {
        var open = menu.classList.toggle('open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        iconUse.setAttribute('href', open ? '#i-x' : '#i-menu');
      });
    }
  }

  /* Scale a self-contained demo iframe to fit its container, preserving the
     demo's native aspect ratio (mirrors the design's <Embed> component). */
  function wireEmbeds() {
    var embeds = [].slice.call(document.querySelectorAll('.embed'));
    embeds.forEach(function (wrap) {
      var base = parseFloat(wrap.dataset.base) || 1440;
      var ratio = parseFloat(wrap.dataset.ratio) || 0.64;
      var baseH = Math.round(base * ratio);
      wrap.style.aspectRatio = base + ' / ' + baseH;
      var iframe = wrap.querySelector('iframe');
      if (!iframe) return;
      iframe.style.width = base + 'px';
      iframe.style.height = baseH + 'px';
      var apply = function () { iframe.style.transform = 'scale(' + (wrap.clientWidth / base) + ')'; };
      apply();
      if (window.ResizeObserver) { new ResizeObserver(apply).observe(wrap); }
      else { window.addEventListener('resize', apply); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  // expose the icon helper for page scripts
  window.orcaIcon = ic;
})();
