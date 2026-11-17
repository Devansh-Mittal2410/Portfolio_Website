document.addEventListener('DOMContentLoaded', function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress = document.querySelector('.scroll-progress');
  const cursor = document.querySelector('.cursor');
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const roleElement = document.querySelector('.role-rotate');

  function updateProgress() {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = `scaleX(${height ? window.scrollY / height : 0})`;
  }
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      header.classList.toggle('nav-open');
      menuToggle.setAttribute('aria-expanded', header.classList.contains('nav-open'));
    });
  }
  document.querySelectorAll('.site-nav a').forEach(function (link) {
    link.addEventListener('click', function () { header.classList.remove('nav-open'); });
  });

  if (cursor && !reducedMotion && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', function (event) {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    });
    document.querySelectorAll('a, button, .magnetic').forEach(function (element) {
      element.addEventListener('pointerenter', function () { cursor.classList.add('is-hover'); });
      element.addEventListener('pointerleave', function () { cursor.classList.remove('is-hover'); });
    });
  }

  document.querySelectorAll('.magnetic').forEach(function (element) {
    element.addEventListener('pointermove', function (event) {
      if (reducedMotion) return;
      const bounds = element.getBoundingClientRect();
      const x = (event.clientX - bounds.left - bounds.width / 2) * 0.18;
      const y = (event.clientY - bounds.top - bounds.height / 2) * 0.18;
      element.style.transform = `translate(${x}px, ${y}px)`;
    });
    element.addEventListener('pointerleave', function () { element.style.transform = ''; });
  });

  document.querySelectorAll('[data-tilt]').forEach(function (element) {
    element.addEventListener('pointermove', function (event) {
      if (reducedMotion || window.matchMedia('(pointer: coarse)').matches) return;
      const bounds = element.getBoundingClientRect();
      const strength = Number(element.dataset.tilt) || 5;
      const rotateX = ((event.clientY - bounds.top) / bounds.height - 0.5) * -strength;
      const rotateY = ((event.clientX - bounds.left) / bounds.width - 0.5) * strength;
      element.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    element.addEventListener('pointerleave', function () { element.style.transform = ''; });
  });

  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (element) {
    if (reducedMotion) element.classList.add('is-visible');
    else revealObserver.observe(element);
  });

  if (roleElement && !reducedMotion) {
    const roles = roleElement.dataset.roles.split('|');
    let roleIndex = 0;
    let characterIndex = roles[0].length;
    let deleting = true;
    function typeRole() {
      const role = roles[roleIndex];
      roleElement.textContent = role.slice(0, characterIndex);
      characterIndex += deleting ? -1 : 1;
      if (characterIndex === 0) { deleting = false; roleIndex = (roleIndex + 1) % roles.length; }
      if (characterIndex === role.length) { deleting = true; window.setTimeout(typeRole, 1400); return; }
      window.setTimeout(typeRole, deleting ? 48 : 80);
    }
    window.setTimeout(typeRole, 1800);
  }

  const filterButtons = document.querySelectorAll('.filter-button');
  const projects = document.querySelectorAll('[data-project-category]');
  const projectCount = document.querySelector('.project-count');
  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const filter = button.dataset.filter;
      let visible = 0;
      filterButtons.forEach(function (item) { item.classList.toggle('active', item === button); });
      projects.forEach(function (project) {
        const matches = filter === 'all' || project.dataset.projectCategory === filter;
        project.classList.toggle('is-hidden', !matches);
        if (matches) visible += 1;
      });
      if (projectCount) projectCount.textContent = `${String(visible).padStart(2, '0')} projects`;
    });
  });

  const promptForm = document.querySelector('.ai-prompt-form');
  const promptInput = document.querySelector('#ai-prompt');
  const outputText = document.querySelector('.output-text');
  const outputTime = document.querySelector('.output-time');
  const runButton = document.querySelector('.run-prompt');
  const responses = {
    product: 'I start with the user and the constraint. Then I reduce the idea to one valuable loop, prototype the riskiest interaction, and measure whether it earns a second use.',
    technical: 'My edge is connecting product intent to implementation detail. I enjoy turning fuzzy requirements into clean React interfaces, resilient APIs, and data-informed decisions.',
    architecture: 'A pragmatic shape: React client for interaction, Node services for domain logic, MongoDB for flexible records, and small observable boundaries so every failure has a place to surface.',
    default: 'Good question. I would break it into the user goal, the smallest useful interaction, the data it needs, and the signal that tells us it is working.'
  };
  function chooseResponse(prompt) {
    const value = prompt.toLowerCase();
    if (value.includes('product') || value.includes('idea')) return responses.product;
    if (value.includes('skill') || value.includes('technical')) return responses.technical;
    if (value.includes('architecture') || value.includes('system')) return responses.architecture;
    return responses.default;
  }
  document.querySelectorAll('.prompt-chip').forEach(function (chip) {
    chip.addEventListener('click', function () { promptInput.value = chip.dataset.prompt; promptInput.focus(); });
  });
  if (promptForm && promptInput && outputText) {
    promptForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const prompt = promptInput.value.trim();
      if (!prompt || runButton.disabled) return;
      const response = chooseResponse(prompt);
      let index = 0;
      runButton.disabled = true;
      runButton.querySelector('span').textContent = 'Thinking';
      outputTime.textContent = 'processing';
      outputText.textContent = '';
      const timer = window.setInterval(function () {
        outputText.textContent = response.slice(0, index);
        index += 2;
        if (index > response.length) {
          window.clearInterval(timer);
          runButton.disabled = false;
          runButton.querySelector('span').textContent = 'Run prompt';
          outputTime.textContent = `${String(Math.floor(38 + Math.random() * 24)).padStart(3, '0')}ms`;
        }
      }, reducedMotion ? 1 : 18);
    });
  }
  const latency = document.querySelector('[data-metric="latency"]');
  if (latency && !reducedMotion) {
    window.setInterval(function () { latency.textContent = String(Math.floor(38 + Math.random() * 18)).padStart(3, '0'); }, 2400);
  }
});
