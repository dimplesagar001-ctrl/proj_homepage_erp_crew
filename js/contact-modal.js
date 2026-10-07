/* ══════════════════════════════════════════════════════════
   CONTACT MODAL — shared audit / free-call request form
══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var modal = document.getElementById('contact-modal');
    var form = document.getElementById('contact-form');
    var success = document.getElementById('contact-form-success');
    if (!modal || !form) return;

    var lastTrigger = null;
    var firstInput = document.getElementById('contact-name');

    function openModal(event) {
      if (event) event.preventDefault();
      lastTrigger = event ? event.currentTarget : null;
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('contact-modal-open');
      window.setTimeout(function () {
        if (firstInput) firstInput.focus();
      }, 40);
    }

    function resetFormState() {
      form.reset();
      form.classList.remove('hidden');
      if (success) success.classList.add('hidden');
    }

    function closeModal() {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('contact-modal-open');
      resetFormState();
      if (lastTrigger && document.body.contains(lastTrigger)) {
        lastTrigger.focus();
      }
    }

    document.querySelectorAll('[data-contact-modal-trigger]').forEach(function (trigger) {
      trigger.addEventListener('click', openModal);
    });

    document.querySelectorAll('[data-contact-modal-close]').forEach(function (closeButton) {
      closeButton.addEventListener('click', closeModal);
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var submitButton = form.querySelector('[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending…';
      }

      window.setTimeout(function () {
        form.classList.add('hidden');
        if (success) success.classList.remove('hidden');
      }, 450);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
      }
    });
  });
})();