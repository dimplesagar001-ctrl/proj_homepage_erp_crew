/* ══════════════════════════════════════════════════════════
   MATCHED AGENT CHAT — scripted preview widget
══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var currentAgent = {
    name: 'Supply Chain Optimization Agent',
    category: 'Supply Chain',
    description: 'I analyze procurement, inventory, supplier, and order data to identify risks, optimize supply planning, and support faster, smarter supply chain decisions.'
  };

  var chatNames = {
    'Supply Chain': 'Supply Chain Optimization Agent'
  };

  var chatDescriptions = {
    'Supply Chain': 'I analyze procurement, inventory, supplier, and order data to identify risks, optimize supply planning, and support faster, smarter supply chain decisions.'
  };

  var promptSets = {
    'Supply Chain': [
      'What’s the current status of our supply chain?',
      'Identify potential supply chain disruptions',
      'Recommend actions to improve fulfillment'
    ],
    'O2C': [
      'Where are our open orders getting delayed?',
      'Show me invoices that need attention',
      'Recommend actions to improve cash flow'
    ],
    'P2P': [
      'Which purchase orders need attention?',
      'Identify supplier risks in our current pipeline',
      'Recommend ways to improve procurement'
    ],
    'Platform': [
      'Which approvals are currently blocked?',
      'Summarize our most important workflow insights',
      'Recommend a process to automate first'
    ],
    'D365 BA': [
      'What should I know about our business today?',
      'Highlight the biggest performance changes',
      'Recommend actions from our latest data'
    ]
  };

  function addMessage(messages, text, type) {
    var message = document.createElement('div');
    message.className = 'agent-chat-message agent-chat-message--' + type;
    message.textContent = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  }

  function buildReply(request) {
    var lowerRequest = request.toLowerCase();
    if (lowerRequest.indexOf('disrupt') !== -1 || lowerRequest.indexOf('risk') !== -1) {
      return 'I’ll review supplier performance, inventory coverage, open orders, and demand signals to surface the highest-priority risks and suggested mitigations.';
    }
    if (lowerRequest.indexOf('recommend') !== -1 || lowerRequest.indexOf('improve') !== -1 || lowerRequest.indexOf('action') !== -1) {
      return 'I’ll compare the current process signals and return a prioritized action list with the expected operational impact.';
    }
    return 'I’ll bring together the latest ERP signals and summarize what needs attention, what is on track, and where your team can act next.';
  }

  function updateAgent(agent, option) {
    var category = option.cat || option.label;
    currentAgent = {
      name: chatNames[category] || (agent && agent.name ? agent.name : (option.label + ' Agent')),
      category: category,
      description: chatDescriptions[category] || option.chatDescription || (agent && agent.desc) || currentAgent.description
    };

    var name = document.getElementById('agent-chat-agent-name');
    var meta = document.getElementById('agent-chat-agent-meta');
    var greeting = document.getElementById('agent-chat-greeting');
    var prompts = document.getElementById('agent-chat-prompts');
    if (name) name.textContent = currentAgent.name;
    if (meta) meta.textContent = currentAgent.category + ' · ERP';
    if (greeting && !greeting.dataset.hasConversation) {
      greeting.textContent = 'Hi, I’m KDS ERP Crew. ' + currentAgent.description;
    }
    if (prompts) {
      prompts.innerHTML = '';
      (promptSets[currentAgent.category] || promptSets.Platform).forEach(function (prompt) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'agent-chat-prompt';
        button.textContent = prompt;
        prompts.appendChild(button);
      });
    }
  }

  function initAgentChat() {
    var widget = document.getElementById('agent-chat-widget');
    var launcher = document.getElementById('agent-chat-launcher');
    var close = document.getElementById('agent-chat-close');
    var panel = document.getElementById('agent-chat-panel');
    var form = document.getElementById('agent-chat-form');
    var input = document.getElementById('agent-chat-input');
    var messages = document.getElementById('agent-chat-messages');
    var prompts = document.getElementById('agent-chat-prompts');
    if (!widget || !launcher || !panel || !form || !input || !messages) return;

    function setOpen(isOpen) {
      widget.classList.toggle('is-open', isOpen);
      launcher.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      if (isOpen) {
        window.setTimeout(function () { input.focus(); }, 100);
      }
    }

    function sendMessage(text) {
      var request = text.trim();
      if (!request) return;
      addMessage(messages, request, 'user');
      var greeting = document.getElementById('agent-chat-greeting');
      if (greeting) greeting.dataset.hasConversation = 'true';
      input.value = '';
      window.setTimeout(function () {
        addMessage(messages, buildReply(request), 'bot');
      }, 420);
    }

    launcher.addEventListener('click', function () {
      setOpen(!widget.classList.contains('is-open'));
    });
    if (close) close.addEventListener('click', function () { setOpen(false); });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      sendMessage(input.value);
    });
    if (prompts) {
      prompts.addEventListener('click', function (event) {
        var prompt = event.target.closest('.agent-chat-prompt');
        if (prompt) sendMessage(prompt.textContent);
      });
    }
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && widget.classList.contains('is-open')) {
        setOpen(false);
      }
    });
  }

  window.updateMatchedAgentChat = updateAgent;
  document.addEventListener('DOMContentLoaded', initAgentChat);
})();