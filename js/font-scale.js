/* Match primary headings and supporting text to the Home Page's two reference sizes. */
(function () {
  'use strict';

  var SCALE = 0.9;
  var originalInlineSizes = new Map();
  var updatePending = false;
  var textControls = 'input:not([type="hidden"]), textarea, select, option';

  function hasDirectText(element) {
    if (element.matches('.business-benefit-metric strong, .business-benefit-metric span')) return false;
    if (element.matches(textControls)) return true;

    return Array.prototype.some.call(element.childNodes, function (node) {
      return node.nodeType === Node.TEXT_NODE && /\S/.test(node.nodeValue || '');
    });
  }

  function isPrimaryHeading(element) {
    var heading = element.closest('h1, h2');
    return Boolean(
      heading &&
      !heading.closest('#agent-chat-widget, #demo-modal, #contact-modal, .site-footer')
    );
  }

  function restoreOriginalSizes() {
    originalInlineSizes.forEach(function (original, element) {
      if (!element.isConnected) {
        originalInlineSizes.delete(element);
        return;
      }

      if (original.value) {
        element.style.setProperty('font-size', original.value, original.priority);
      } else {
        element.style.removeProperty('font-size');
      }
    });
  }

  function scalePageText() {
    restoreOriginalSizes();

    var headingReference = document.getElementById('agents-action-heading');
    var contentReference = document.querySelector('.agents-action-intro > p:last-child');
    if (!headingReference || !contentReference) {
      console.error('Home Page font-size references were not found.');
      return;
    }

    var headingSize = Number.parseFloat(window.getComputedStyle(headingReference).fontSize) * SCALE;
    var contentSize = Number.parseFloat(window.getComputedStyle(contentReference).fontSize) * SCALE;
    if (!Number.isFinite(headingSize) || !Number.isFinite(contentSize)) {
      console.error('Home Page font-size references could not be measured.');
      return;
    }

    var textElements = Array.prototype.filter.call(
      document.body.querySelectorAll('*'),
      hasDirectText
    );
    textElements.forEach(function (element) {
      var targetSize = isPrimaryHeading(element) ? headingSize : contentSize;
      if (element.matches('#wheel-list li span')) targetSize *= 1.12;

      if (!originalInlineSizes.has(element)) {
        originalInlineSizes.set(element, {
          value: element.style.getPropertyValue('font-size'),
          priority: element.style.getPropertyPriority('font-size')
        });
      }

      element.style.setProperty('font-size', targetSize.toFixed(3) + 'px', 'important');
    });
  }

  function scheduleScale() {
    if (updatePending) return;
    updatePending = true;

    window.requestAnimationFrame(function () {
      updatePending = false;
      scalePageText();
    });
  }

  var observer = new MutationObserver(scheduleScale);
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true
  });

  window.addEventListener('resize', scheduleScale);
  scalePageText();
})();
