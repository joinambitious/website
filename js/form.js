document.addEventListener('DOMContentLoaded', () => {
  if (document.referrer.includes('index.html')) {
    localStorage.removeItem('formState');
    localStorage.removeItem('currentStep');
  }

  const formQuestions = [
    {
      title: 'Choose your focus',
      description: 'What brings you to Ambitious?',
      name: 'focus',
      type: 'radio',
      options: [
        'Build a product',
        'Launch a project',
        'Grow an audience',
        'Creative pursuit',
        'Something else'
      ],
      icons: ['interests', 'rocket_launch', 'diversity_1', 'star_shine', 'emoji_objects']
    },
    {
      title: 'Set your objective',
      description: 'What would progress look like this month?',
      name: 'objective',
      type: 'radio',
      options: [
        'Develop a new routine',
        'Clarify the direction',
        'Complete a milestone',        
        'Validate my idea',
        'Something else'
      ],
      icons: [
        'early_on', 
        'explore', 
        'editor_choice', 
        'sentiment_very_satisfied', 
        'emoji_objects'
      ]
    },
    {
      title: 'Clarify your motivation',
      description: 'Why is this important to you?',
      name: 'motivation',
      type: 'textarea'
    },
    {
      title: 'Identify your blockers',
      description: 'What feels most challenging?',
      name: 'blockers',
      type: 'radio',
      options: [
        'I haven\'t decided how to start',
        'I haven\'t set a clear goal',
        'I haven\'t found time to focus',
        'I haven\'t had group support',
        'Something else'
      ]
    },
    {
      title: 'Join your group',
      description: 'What time works best?',
      name: 'meeting',
      type: 'radio',
      options: [
        'Fridays at 8am PST',
        'Fridays at 9am PST',
        'Wednesdays at 8am PST',
        'Wednesdays at 9am PST',
        'Another time'
      ],
      badges: [
        'Most popular',
        '',
        '',
        '',
        ''
      ]
    },
    {
      title: 'Share your name',
      description: 'What\'s your full name?',
      name: 'name',
      type: 'text'
    },
    {
      title: 'Enter your email',
      description: 'Where can we reach you?',
      name: 'email',
      type: 'email'
    },
    {
      title: 'Choose your membership',
      description: 'Try Ambitious free for 2 weeks.',
      name: 'plan',
      type: 'radio',
      options: ['$19 monthly', '$44 every 3 months', '$159 annually'], // MUST MATCH OPTIONS IN PLANLOOKUP
      icons: ['calendar_today', 'date_range', 'calendar_month'],
      badges: [
        '',              // No badge for Monthly
        'Save 20%',      // Quarterly badge
        'Save 30%'       // Annual badge
      ]
    }
  ];

  const stripeLinks = {
    monthly: 'https://billing.ambitious.app/b/5kAcNKcOl4aX4bm14b',
    quarterly: 'https://billing.ambitious.app/b/aEU5licOl0YLazKcMU',
    annual: 'https://billing.ambitious.app/b/00g4he01zePB7ny9AJ'
  };

  // MUST MATCH OPTIONS ABOVE
  const planLookup = {
    '$19 monthly': 'monthly',
    '$44 every 3 months': 'quarterly',
    '$159 annually': 'annual'
  };

  const form = document.getElementById('join-form');
  const container = document.getElementById('form-steps-container');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const submitBtn = document.getElementById('submit-btn');
  const progressBar = document.getElementById('progress-bar');

  const steps = [];

  let formState = JSON.parse(localStorage.getItem('formState')) || {};
  let currentStep = parseInt(localStorage.getItem('currentStep')) || 0;

  // === BUILD FORM ===
  formQuestions.forEach((question) => {
    const stepDiv = document.createElement('div');
    stepDiv.classList.add('form-step');

    // Label (Title)
    const labelEl = document.createElement('label');
    labelEl.setAttribute('for', question.name);
    labelEl.textContent = question.title;
    stepDiv.appendChild(labelEl);

    // Description
    if (question.description) {
      const descEl = document.createElement('div');
      descEl.classList.add('description');
      descEl.textContent = question.description;
      stepDiv.appendChild(descEl);
    }

    // === TEXTAREA ===
    if (question.type === 'textarea') {
      const textarea = document.createElement('textarea');
      textarea.name = question.name;
      textarea.id = question.name;
      textarea.required = true;
      textarea.value = formState[question.name] || '';
      stepDiv.appendChild(textarea);

  // === RADIO BUTTONS ===
  } else if (question.type === 'radio') {
    question.options.forEach((option, idx) => {
      const radioWrapper = document.createElement('div');
      radioWrapper.classList.add('radio-option');

      const radioInput = document.createElement('input');
      radioInput.type = 'radio';
      radioInput.name = question.name;
      radioInput.value = option;
      radioInput.id = `${question.name}-${option}`;

      if (formState[question.name] === option) {
        radioInput.checked = true;
        radioWrapper.classList.add('selected');
      }

      const radioLabel = document.createElement('label');
      radioLabel.setAttribute('for', radioInput.id);
      radioLabel.classList.add('radio-label'); // ✅ Optional for flex styles

      // ✅ ICON + LABEL TEXT container
      const labelContent = document.createElement('span');
      labelContent.classList.add('label-content'); // ✅ Flex container

      // ICON (optional)
      if (question.icons && question.icons[idx]) {
        const iconSpan = document.createElement('span');
        iconSpan.classList.add('material-symbols-outlined', 'radio-icon');
        iconSpan.textContent = question.icons[idx];
        labelContent.appendChild(iconSpan);
      }

      // Label Text
      const labelText = document.createElement('span');
      labelText.classList.add('label-text');
      labelText.textContent = option;
      labelContent.appendChild(labelText);

      // Append the labelContent group to the label
      radioLabel.appendChild(labelContent);

      // BADGE (optional)
      if (question.badges && question.badges[idx]) {
        const badgeSpan = document.createElement('span');
        badgeSpan.classList.add('tag');
        badgeSpan.textContent = question.badges[idx];
        radioLabel.appendChild(badgeSpan);
      }

      radioWrapper.appendChild(radioInput);
      radioWrapper.appendChild(radioLabel);
      stepDiv.appendChild(radioWrapper);
    });
  } else {
      const input = document.createElement('input');
      input.type = question.type;
      input.name = question.name;
      input.id = question.name;
      input.required = true;
      input.value = formState[question.name] || '';
      stepDiv.appendChild(input);
    }

    // Add the step to container and steps array
    container.appendChild(stepDiv);
    steps.push(stepDiv);
  });

  function showStep(index) {
    if (index < 0 || index >= steps.length) {
      console.warn('Invalid step index:', index);
      currentStep = 0;
    }

    steps.forEach((step, i) => {
      step.classList.toggle('form-step-active', i === currentStep);
    });

    prevBtn.style.display = currentStep === 0 ? 'inline-block' : 'inline-block';
    nextBtn.style.display = currentStep < steps.length - 1 ? 'inline-block' : 'none';
    submitBtn.style.display = currentStep === steps.length - 1 ? 'inline-block' : 'none';

    updateProgressBar();

    // Add event listeners to non-radio inputs for live validation
    const inputs = steps[currentStep].querySelectorAll('textarea, input[type="text"], input[type="email"]');

    inputs.forEach(input => {
      input.addEventListener('input', () => {
        saveStepData();
        validateCurrentStep();
      });
    });

    // Validate immediately on showing the step
    validateCurrentStep();
    localStorage.setItem('currentStep', currentStep);
  }

  function updateProgressBar() {
    if (!progressBar) return;
    const progressPercent = ((currentStep + 1) / steps.length) * 100;
    progressBar.style.width = `${progressPercent}%`;
  }

  function saveStepData() {
    const inputs = steps[currentStep].querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
      if (input.type === 'radio') {
        if (input.checked) {
          formState[input.name] = input.value;
        }
      } else {
        formState[input.name] = input.value;
      }
    });

    localStorage.setItem('formState', JSON.stringify(formState));
  }

  function validateCurrentStep() {
    const inputs = steps[currentStep].querySelectorAll('input, textarea, select');
    let isValid = true;

    inputs.forEach(input => {
      if (input.type === 'radio') {
        const radioGroup = steps[currentStep].querySelectorAll(`input[name="${input.name}"]`);
        const oneChecked = Array.from(radioGroup).some(radio => radio.checked);
        if (!oneChecked) isValid = false;
      } else if (input.required && !input.value.trim()) {
        isValid = false;
      }

      if (input.type === 'email' && input.value.trim() && !isValidEmail(input.value.trim())) {
        isValid = false;
      }
    });

    if (currentStep === steps.length - 1) {
      submitBtn.disabled = !isValid;
      submitBtn.classList.toggle('button-disabled', !isValid);
    } else {
      nextBtn.disabled = !isValid;
      nextBtn.classList.toggle('button-disabled', !isValid);
    }
  }

  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  nextBtn.addEventListener('click', () => {
    saveStepData();
    if (currentStep < steps.length - 1) {
      currentStep++;
      showStep(currentStep);
    }
  });

  prevBtn.addEventListener('click', () => {
    saveStepData();
    if (currentStep === 0) {
      window.location.href = 'index.html';
    } else {
      currentStep--;
      showStep(currentStep);
    }
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    saveStepData();

    const selectedPlan = formState.plan;
    const planValue = planLookup[selectedPlan];
    const stripeLink = stripeLinks[planValue];

    if (!stripeLink) {
      alert('Please select a valid membership option.');
      return;
    }

    const userEmail = formState.email;
    if (!userEmail) {
      alert('Please provide your email.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const formData = new FormData();
    Object.keys(formState).forEach(key => formData.append(key, formState[key]));

    fetch('https://script.google.com/macros/s/AKfycbwuVgEqVRQvAp6MbXwzDIuHhopZeCqwwWPmVPcHy99u7hdGVuBQcMwokqyJYJV1pB4/exec', {
      method: 'POST',
      body: formData
    })
      .then(response => response.text())
      .then(data => {
        console.log('Form submission successful:', data);
        localStorage.removeItem('formState');
        localStorage.removeItem('currentStep');

        const redirectUrl = `${stripeLink}?prefilled_email=${encodeURIComponent(userEmail)}`;
        window.location.href = redirectUrl;
      })
      .catch(error => {
        console.error('Form submission error:', error);
        alert('There was a problem submitting the form.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
      });
  });

  function setupCustomRadios() {
    const radioOptions = document.querySelectorAll('.radio-option');
    radioOptions.forEach(option => {
      option.addEventListener('click', () => {
        const radioInput = option.querySelector('input[type="radio"]');
        const radioName = radioInput.name;

        document.querySelectorAll(`input[name="${radioName}"]`).forEach(input => {
          input.closest('.radio-option').classList.remove('selected');
        });

        option.classList.add('selected');
        radioInput.checked = true;
        radioInput.dispatchEvent(new Event('change'));

        saveStepData();
        validateCurrentStep();
      });
    });
  }

  showStep(currentStep);
  setupCustomRadios();
});