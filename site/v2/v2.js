/* ============================================================
   ORCA HOMEPAGE V2 — interactions
   GSAP + ScrollTrigger + Lenis + Three.js particle ocean
   ============================================================ */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isCoarse = window.matchMedia('(pointer: coarse)').matches;
  var hasGSAP = typeof gsap !== 'undefined';
  var hasST = typeof ScrollTrigger !== 'undefined';

  if (hasGSAP && hasST) gsap.registerPlugin(ScrollTrigger);

  /* ---------------- Split text into characters ---------------- */
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var text = el.textContent;
    el.textContent = '';
    text.split('').forEach(function (ch) {
      var span = document.createElement('span');
      span.className = 'ch';
      span.innerHTML = ch === ' ' ? '&nbsp;' : ch;
      el.appendChild(span);
    });
  });

  /* ---------------- Smooth scroll (Lenis) ---------------- */
  var lenis = null;
  if (typeof Lenis !== 'undefined' && !prefersReduced) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    if (hasGSAP) {
      lenis.on('scroll', function () { if (hasST) ScrollTrigger.update(); });
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
  }

  // Same-page anchor links work with Lenis
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: 0 });
      else target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------------- Zurich clock ---------------- */
  var clockEl = document.getElementById('clock');
  function tick() {
    if (!clockEl) return;
    clockEl.textContent = new Intl.DateTimeFormat('de-CH', {
      timeZone: 'Europe/Zurich', hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(new Date());
  }
  tick();
  setInterval(tick, 1000);

  /* ---------------- Sonar embed scaler ---------------- */
  var embedWrap = document.getElementById('sonarEmbed');
  function sizeEmbed() {
    if (!embedWrap) return;
    var iframe = embedWrap.querySelector('iframe');
    var BASE = 1440, RATIO = 0.66;
    var w = embedWrap.clientWidth;
    iframe.style.width = BASE + 'px';
    iframe.style.height = Math.round(BASE * RATIO) + 'px';
    iframe.style.transform = 'scale(' + (w / BASE) + ')';
    embedWrap.style.height = Math.round(w * RATIO) + 'px';
  }
  sizeEmbed();
  window.addEventListener('resize', sizeEmbed, { passive: true });

  /* ---------------- Three.js particle ocean ---------------- */
  var canvas = document.getElementById('webgl');
  if (canvas && typeof THREE !== 'undefined') {
    try {
      var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      var scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x04070a, 0.055);

      var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
      camera.position.set(0, 2.4, 7.5);
      camera.lookAt(0, 0, 0);

      var COLS = isCoarse ? 80 : 130;
      var ROWS = isCoarse ? 55 : 85;
      var SPREAD_X = 30, SPREAD_Z = 22;
      var count = COLS * ROWS;
      var positions = new Float32Array(count * 3);
      var colors = new Float32Array(count * 3);

      var cyan = new THREE.Color(0x00c0e9);
      var teal = new THREE.Color(0x3a5f6d);
      var tmp = new THREE.Color();

      var i = 0;
      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          positions[i * 3] = (c / (COLS - 1) - 0.5) * SPREAD_X;
          positions[i * 3 + 1] = 0;
          positions[i * 3 + 2] = (r / (ROWS - 1) - 0.5) * SPREAD_Z;
          tmp.copy(cyan).lerp(teal, r / (ROWS - 1));
          colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b;
          i++;
        }
      }

      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      var mat = new THREE.PointsMaterial({
        size: 0.05, vertexColors: true, transparent: true, opacity: 0.85,
        depthWrite: false, blending: THREE.AdditiveBlending
      });

      var points = new THREE.Points(geo, mat);
      points.position.y = -1.4;
      scene.add(points);

      var mouseX = 0, mouseY = 0;
      if (!isCoarse) {
        window.addEventListener('pointermove', function (e) {
          mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
          mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        }, { passive: true });
      }

      function resize() {
        var w = canvas.clientWidth, h = canvas.clientHeight;
        if (canvas.width !== w || canvas.height !== h) {
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        }
      }
      window.addEventListener('resize', resize, { passive: true });

      var heroVisible = true;
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          heroVisible = entries[0].isIntersecting;
        }).observe(document.getElementById('hero'));
      }

      var pos = geo.attributes.position.array;
      var t = 0;
      function wave(x, z, t) {
        return Math.sin(x * 0.55 + t) * 0.32 +
               Math.sin(z * 0.8 + t * 0.7) * 0.25 +
               Math.sin((x + z) * 0.3 + t * 1.3) * 0.18;
      }

      function render() {
        requestAnimationFrame(render);
        if (!heroVisible) return;
        resize();
        t += prefersReduced ? 0 : 0.012;
        for (var j = 0; j < count; j++) {
          pos[j * 3 + 1] = wave(pos[j * 3], pos[j * 3 + 2], t);
        }
        geo.attributes.position.needsUpdate = true;
        camera.position.x += (mouseX * 0.9 - camera.position.x) * 0.04;
        camera.position.y += (2.4 - mouseY * 0.5 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
      }
      resize();
      render();
    } catch (e) {
      canvas.style.display = 'none';
    }
  }

  /* ---------------- Preloader + hero intro ---------------- */
  var loader = document.getElementById('loader');
  var loaderCount = document.getElementById('loaderCount');
  var loaderBar = document.getElementById('loaderBar');

  function heroIntro() {
    if (!hasGSAP) return;
    var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.fromTo('.hero__title .ch',
      { yPercent: 110 },
      { yPercent: 0, duration: 1.1, stagger: 0.035 }, 0)
      .fromTo('.hero [data-reveal], .nav',
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.5);
  }

  function dismissLoader() {
    if (!loader) return;
    if (hasGSAP && !prefersReduced) {
      gsap.to(loader, {
        yPercent: -100, duration: 0.9, ease: 'power4.inOut', delay: 0.15,
        onStart: heroIntro,
        onComplete: function () { loader.remove(); }
      });
    } else {
      loader.remove();
      heroIntro();
    }
  }

  if (hasGSAP && !prefersReduced) {
    // Hide animated elements up-front (JS-only, so no-JS users still see content)
    gsap.set('.hero__title .ch', { yPercent: 110 });
    gsap.set('.hero [data-reveal], .nav', { autoAlpha: 0 });

    var counter = { v: 0 };
    gsap.to(counter, {
      v: 100, duration: 1.6, ease: 'power2.inOut',
      onUpdate: function () {
        loaderCount.textContent = Math.round(counter.v);
        loaderBar.style.width = counter.v + '%';
      },
      onComplete: dismissLoader
    });
  } else {
    dismissLoader();
  }

  /* ---------------- Scroll reveals ---------------- */
  if (hasGSAP && hasST && !prefersReduced) {

    gsap.utils.toArray('main section:not(.hero) [data-reveal]').forEach(function (el) {
      gsap.fromTo(el, { autoAlpha: 0, y: 36 }, {
        autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    // Final CTA big type
    gsap.fromTo('.final__title .ch', { yPercent: 110 }, {
      yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.035,
      scrollTrigger: { trigger: '.final', start: 'top 70%' }
    });

    // Reframe: pills slide toward the ORCA panel
    gsap.utils.toArray('[data-pill]').forEach(function (pill, idx) {
      gsap.fromTo(pill, { autoAlpha: 0, x: -40 }, {
        autoAlpha: 1, x: 0, duration: 0.7, ease: 'power3.out', delay: idx * 0.1,
        scrollTrigger: { trigger: '.reframe__stage', start: 'top 80%' }
      });
    });
    gsap.fromTo('.reframe__orca', { scale: 0.92 }, {
      scale: 1, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: '.reframe__stage', start: 'top 80%' }
    });

    // Segment rows
    gsap.utils.toArray('.seg__row').forEach(function (row, idx) {
      gsap.fromTo(row, { autoAlpha: 0, x: -34 }, {
        autoAlpha: 1, x: 0, duration: 0.8, ease: 'power3.out', delay: idx * 0.06,
        scrollTrigger: { trigger: row, start: 'top 92%' }
      });
    });

    // Metric counters
    gsap.utils.toArray('[data-count]').forEach(function (el) {
      var target = parseInt(el.dataset.count, 10);
      var obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.6, ease: 'power2.out',
        onUpdate: function () { el.textContent = Math.round(obj.v); },
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

  } else {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      el.textContent = el.dataset.count;
    });
  }

  /* ---------------- Marquee ---------------- */
  if (hasGSAP && !prefersReduced) {
    gsap.to('#marquee', { xPercent: -50, duration: 26, ease: 'none', repeat: -1 });
  }

  /* ---------------- Custom cursor + magnetic ---------------- */
  if (!isCoarse) {
    var cursor = document.getElementById('cursor');
    var label = document.getElementById('cursorLabel');
    if (cursor && hasGSAP) {
      var xTo = gsap.quickTo(cursor, 'x', { duration: 0.18, ease: 'power3.out' });
      var yTo = gsap.quickTo(cursor, 'y', { duration: 0.18, ease: 'power3.out' });
      window.addEventListener('pointermove', function (e) {
        cursor.classList.add('cursor--on');
        xTo(e.clientX); yTo(e.clientY);
      }, { passive: true });

      document.querySelectorAll('[data-cursor]').forEach(function (el) {
        el.addEventListener('pointerenter', function () {
          var mode = el.dataset.cursor;
          cursor.classList.toggle('cursor--link', mode === 'link');
          cursor.classList.toggle('cursor--view', mode === 'view');
          label.textContent = mode === 'view' ? 'View' : '';
        });
        el.addEventListener('pointerleave', function () {
          cursor.classList.remove('cursor--link', 'cursor--view');
          label.textContent = '';
        });
      });
    }

    // Magnetic buttons
    if (hasGSAP) {
      document.querySelectorAll('[data-magnetic]').forEach(function (el) {
        var strength = 0.3;
        el.addEventListener('pointermove', function (e) {
          var b = el.getBoundingClientRect();
          gsap.to(el, {
            x: (e.clientX - b.left - b.width / 2) * strength,
            y: (e.clientY - b.top - b.height / 2) * strength,
            duration: 0.4, ease: 'power3.out'
          });
        });
        el.addEventListener('pointerleave', function () {
          gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
        });
      });
    }
  }
})();
