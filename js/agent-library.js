/* ============================================================
   KDS ERP Crew — Agent Library Page JavaScript
   Covers: search, category filter, agent grid, demo modal
   All vanilla JS — no React, no npm, no server required.
   ============================================================ */

(function () {
  'use strict';

  var FILTERS = ['All', 'O2C', 'P2P', 'Supply Chain', 'Finance', 'Platform',
    'Insurance', 'Manufacturing', 'Retail & CPG', 'Healthcare',
    'Trade Finance', 'BFSI', 'D365', 'D365 BA'];

  var currentFilter = 'All';
  var currentQuery = '';
  var modalAgent = null;

  /* ── Escape HTML ─────────────────────────────────────────── */
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Filtering ───────────────────────────────────────────── */
  function getFiltered() {
    var q = currentQuery.trim().toLowerCase();
    return AGENTS.filter(function (a) {
      if (currentFilter !== 'All' && a.cat !== currentFilter) return false;
      if (!q) return true;
      return a.name.toLowerCase().indexOf(q) !== -1 || a.desc.toLowerCase().indexOf(q) !== -1;
    });
  }

  function getAgentIconCluster() {
    return '<div class="catalogue-agent-icon-stack" aria-hidden="true">' +
      '<span class="catalogue-agent-icon catalogue-agent-icon-navy"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="7"/></svg></span>' +
      '<span class="catalogue-agent-icon catalogue-agent-icon-teal"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/><path d="M10 7h3a3 3 0 0 1 3 3v4"/></svg></span>' +
      '<span class="catalogue-agent-icon catalogue-agent-icon-orange"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5M4 19h16"/><path d="m7 15 3-4 3 2 5-7"/></svg></span>' +
      '</div>';
  }

  /* ── Render grid ─────────────────────────────────────────── */
  function renderGrid() {
    var grid = document.getElementById('catalogue-grid');
    var countEl = document.getElementById('catalogue-count');
    var emptyEl = document.getElementById('catalogue-empty');
    if (!grid) return;

    var filtered = getFiltered();

    // Count label
    var label = currentFilter !== 'All'
      ? (currentFilter === 'D365 BA' ? 'D365 Business' : currentFilter)
      : '';
    var shown = filtered.length + ' shown';
    if (label) shown += ' in ' + label;
    if (currentQuery) shown += ' matching "' + currentQuery + '"';
    if (countEl) {
      countEl.innerHTML = 'Showing <span class="font-semibold text-foreground">' + filtered.length + '</span> results' +
        (label ? ' in ' + escHtml(label) : '') +
        (currentQuery ? ' matching &ldquo;' + escHtml(currentQuery) + '&rdquo;' : '');
    }

    grid.innerHTML = '';

    if (filtered.length === 0) {
      if (emptyEl) emptyEl.classList.remove('hidden');
      return;
    }
    if (emptyEl) emptyEl.classList.add('hidden');

    filtered.forEach(function (agent) {
      var catLabel = FILTER_LABELS[agent.cat] || agent.cat;
      var div = document.createElement('div');
      div.className = 'catalogue-agent-card group';

      var demoBtn = agent.demo
        ? '<button class="catalogue-agent-action demo-open-btn">' +
          'Try this agent <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>' +
          '</button>'
        : '<span class="catalogue-agent-action">Explore agent <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg></span>';

      div.innerHTML =
        getAgentIconCluster() +
        '<h3 class="catalogue-agent-card-title">' + escHtml(agent.name) + '</h3>' +
        '<p class="catalogue-agent-card-description">' + escHtml(agent.desc) + '</p>' +
        demoBtn;

      if (agent.demo) {
        var btn = div.querySelector('.demo-open-btn');
        if (btn) {
          btn.addEventListener('click', function (e) {
            e.stopPropagation();
            openDemoModal(agent);
          });
        }
      }

      grid.appendChild(div);
    });
  }

  /* ── Filter buttons ──────────────────────────────────────── */
  function renderFilterButtons() {
    var bar = document.getElementById('filter-bar');
    if (!bar) return;

    FILTERS.forEach(function (f) {
      var count = f === 'All' ? AGENTS.length : (CATEGORY_COUNTS[f] || 0);
      var label = f === 'All' ? 'All' : (FILTER_LABELS[f] || f);

      var btn = document.createElement('button');
      btn.dataset.filter = f;
      btn.className = 'catalogue-filter-btn filter-btn';
      btn.innerHTML = '<span>' + escHtml(label) + '</span><span class="catalogue-filter-arrow" aria-hidden="true">›</span><span class="filter-count">' + count + '</span>';
      btn.addEventListener('click', function () {
        currentFilter = f;
        updateFilterStyles();
        renderGrid();
      });
      bar.appendChild(btn);
    });
  }

  function updateFilterStyles() {
    document.querySelectorAll('.filter-btn').forEach(function (btn) {
      var isActive = btn.dataset.filter === currentFilter;
      var countSpan = btn.querySelector('.filter-count');
      if (isActive) {
        btn.className = 'catalogue-filter-btn filter-btn catalogue-filter-active';
      } else {
        btn.className = 'catalogue-filter-btn filter-btn';
      }
    });
  }

  /* ── Demo modal ──────────────────────────────────────────── */
  function openDemoModal(agent) {
    var modal = document.getElementById('demo-modal');
    if (!modal) return;
    document.getElementById('demo-modal-cat').textContent = agent.cat;
    document.getElementById('demo-modal-title').textContent = agent.name;
    document.getElementById('demo-modal-desc').textContent = agent.desc;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    modalAgent = agent;
  }
  function closeDemoModal() {
    var modal = document.getElementById('demo-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    modalAgent = null;
  }

  /* ── Search ──────────────────────────────────────────────── */
  function initSearch() {
    var input = document.getElementById('search-input');
    if (!input) return;
    input.addEventListener('input', function () {
      currentQuery = input.value;
      renderGrid();
    });
  }

  /* ── Sticky filter bar: account for header height ─────────── */
  function initStickyFilter() {
    var filterBar = document.getElementById('catalogue-filter-sticky');
    if (!filterBar) return;

    function setStickyTop() {
      var header = document.querySelector('header');
      if (header) {
        var h = header.getBoundingClientRect().height;
        filterBar.style.top = h + 'px';
      }
    }
    setStickyTop();
    window.addEventListener('resize', setStickyTop, { passive: true });
  }

  /* ── Boot ────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    renderFilterButtons();
    updateFilterStyles();
    renderGrid();
    initSearch();
    initStickyFilter();

    var closeBtn = document.getElementById('demo-modal-close');
    var backdrop = document.getElementById('demo-modal-backdrop');
    if (closeBtn) closeBtn.addEventListener('click', closeDemoModal);
    if (backdrop) backdrop.addEventListener('click', closeDemoModal);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDemoModal();
    });
  });

})();
