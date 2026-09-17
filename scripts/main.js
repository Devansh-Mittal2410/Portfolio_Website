// Add your javascript here
// Don't forget to add it into respective layouts where this js file is needed

$(document).ready(function() {
  AOS.init( {
    // uncomment below for on-scroll animations to played only once
    // once: true  
  }); // initialize animate on scroll library
});

document.addEventListener('DOMContentLoaded', function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const roleElement = document.querySelector('[data-roles]');
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);

  function updateProgress() {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${scrollableHeight ? window.scrollY / scrollableHeight : 0})`;
  }

  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });

  if (roleElement && !reducedMotion) {
    const roles = roleElement.dataset.roles.split('|');
    let roleIndex = 0;
    let characterIndex = roleElement.textContent.length;
    let deleting = true;

    function typeRole() {
      const currentRole = roles[roleIndex];
      roleElement.textContent = currentRole.slice(0, characterIndex);
      if (deleting) {
        characterIndex -= 1;
      } else {
        characterIndex += 1;
      }
      if (characterIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      } else if (characterIndex === currentRole.length) {
        deleting = true;
        window.setTimeout(typeRole, 1600);
        return;
      }
      window.setTimeout(typeRole, deleting ? 48 : 82);
    }

    window.setTimeout(typeRole, 1600);
  }

  if (!reducedMotion) {
    document.querySelectorAll('.cc-porfolio-image, .card').forEach(function (card) {
      card.addEventListener('pointermove', function (event) {
        const bounds = card.getBoundingClientRect();
        const rotateX = ((event.clientY - bounds.top) / bounds.height - 0.5) * -3;
        const rotateY = ((event.clientX - bounds.left) / bounds.width - 0.5) * 3;
        card.style.setProperty('--tilt-x', `${rotateX}deg`);
        card.style.setProperty('--tilt-y', `${rotateY}deg`);
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      });
    });
  }

  const filterButtons = document.querySelectorAll('.filter-button');
  const projects = document.querySelectorAll('[data-project-category]');
  const projectCount = document.querySelector('.project-count');
  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const filter = button.dataset.filter;
      let visibleProjects = 0;
      filterButtons.forEach(function (item) { item.classList.toggle('active', item === button); });
      projects.forEach(function (project) {
        const matches = filter === 'all' || project.dataset.projectCategory === filter;
        project.classList.toggle('is-hidden', !matches);
        if (matches) visibleProjects += 1;
      });
      if (projectCount) projectCount.textContent = `${String(visibleProjects).padStart(2, '0')} projects`;
    });
  });

  const promptForm = document.querySelector('.ai-prompt-form');
  const promptInput = document.querySelector('#ai-prompt');
  const outputText = document.querySelector('.output-text');
  const outputTime = document.querySelector('.output-time');
  const runButton = document.querySelector('.run-prompt');
  const promptChips = document.querySelectorAll('.prompt-chip');
  const responses = {
    product: 'I start with the user and the constraint. Then I reduce the idea to one valuable loop, prototype the riskiest interaction, and measure whether it earns a second use.',
    technical: 'My edge is connecting product intent to implementation detail. I enjoy turning fuzzy requirements into clean React interfaces, resilient APIs, and data-informed decisions.',
    architecture: 'A pragmatic shape: React client for interaction, Node services for domain logic, MongoDB for flexible records, and small observable boundaries so every failure has a place to surface.',
    default: 'Good question. I would break it into the user goal, the smallest useful interaction, the data it needs, and the signal that tells us it is working. Then I would build and test that loop.'
  };

  function chooseResponse(prompt) {
    const normalizedPrompt = prompt.toLowerCase();
    if (normalizedPrompt.includes('product') || normalizedPrompt.includes('idea')) return responses.product;
    if (normalizedPrompt.includes('skill') || normalizedPrompt.includes('technical')) return responses.technical;
    if (normalizedPrompt.includes('architecture') || normalizedPrompt.includes('system')) return responses.architecture;
    return responses.default;
  }

  promptChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      promptInput.value = chip.dataset.prompt;
      promptInput.focus();
    });
  });

  if (promptForm && promptInput && outputText) {
    promptForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const prompt = promptInput.value.trim();
      if (!prompt || runButton.disabled) return;
      const response = chooseResponse(prompt);
      let characterIndex = 0;
      runButton.disabled = true;
      runButton.querySelector('span').textContent = 'Thinking';
      outputTime.textContent = 'processing';
      outputText.textContent = '';
      const typeTimer = window.setInterval(function () {
        outputText.textContent = response.slice(0, characterIndex);
        characterIndex += 2;
        if (characterIndex > response.length) {
          window.clearInterval(typeTimer);
          runButton.disabled = false;
          runButton.querySelector('span').textContent = 'Run prompt';
          outputTime.textContent = `${String(Math.floor(38 + Math.random() * 24)).padStart(3, '0')}ms`;
        }
      }, reducedMotion ? 1 : 18);
    });
  }

  const latencyMetric = document.querySelector('[data-metric="latency"]');
  if (latencyMetric && !reducedMotion) {
    window.setInterval(function () {
      latencyMetric.textContent = String(Math.floor(38 + Math.random() * 18)).padStart(3, '0');
    }, 2400);
  }
});

// Smooth scroll for links with hashes
$('a.smooth-scroll').click(function(event) {
  // On-page links
  // Dark mode toggle

  if (
    location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') 
    && 
    location.hostname == this.hostname
  ) {
    // Figure out element to scroll to
    var target = $(this.hash);
    target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
    // Does a scroll target exist?
    if (target.length) {
      // Only prevent default if animation is actually gonna happen
      event.preventDefault();
      $('html, body').animate({
        scrollTop: target.offset().top
      }, 1000, function() {
        // Callback after animation
        // Must change focus!
        var $target = $(target);
        $target.focus();
        if ($target.is(":focus")) { // Checking if the target was focused
          return false;
        } else {
          $target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
          $target.focus(); // Set focus again
        };
      });
    }
  }
});

// Dark mode toggle
document.addEventListener('DOMContentLoaded', function () {
  const toggleBtn = document.getElementById('darkModeToggle');
  const navbar = document.querySelector('.navbar');

  // Apply saved theme
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    if (navbar) navbar.classList.add('dark-mode');
  }

  // Toggle on click
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      if (navbar) navbar.classList.toggle('dark-mode');

      localStorage.setItem(
        'theme',
        document.body.classList.contains('dark-mode') ? 'dark' : 'light'
      );
    });
  }
});
