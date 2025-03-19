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
        'Clarify the direction',
        'Validate my idea',
        'Improve my routine',
        'Complete a milestone',
        'Ship something'
      ],
      icons: ['explore', 'verified', 'early_on', 'fact_check', 'box']
    },
    {
      title: 'Clarify your motivation',
      description: 'Why is this important to you?',
      name: 'motivation',
      type: 'textarea'
    },
    {
      title: 'Identify your blockers',
      description: 'What feels challenging?',
      name: 'blockers',
      type: 'radio',
      options: [
        'I haven\'t decided how to start',
        'I haven\'t set a clear goal',
        'I haven\'t designed a solid plan',
        'I haven\'t had group accountability'
      ]
    },
    {
      title: 'Email Address',
      description: 'Where can we reach you?',
      name: 'email',
      type: 'email'
    },
    {
      title: 'Choose your membership',
      description: 'Select a plan to start your 14-day trial.',
      name: 'plan',
      type: 'radio',
      options: ['Monthly', 'Quarterly', 'Annual'],
      icons: ['calendar_today', 'date_range', 'calendar_month']
    }
  ];

  const stripeLinks = {
    monthly: 'https://billing.ambitious.app/b/fZecNK29HcHt23eaEI',
    quarterly: 'https://billing.ambitious.app/b/cN200Y01zcHteQ04gl',
    annual: 'https://billing.ambitious.app/b/bIY00Y5lT0YLeQ04gm'
  };

  const planLookup = {
    'Monthly': 'monthly',
    'Quarterly': 'quarterly',
    'Annual': 'annual'
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

    const labelEl = document.createElement('label');
    labelEl.setAttribute('for', question.name);
    labelEl.textContent = question.title;
    stepDiv.appendChild(labelEl);

    if (question.description) {
      const descEl = document.createElement('div');
      descEl.classList.add('description');
      descEl.textContent = question.description;
      stepDiv.appendChild(descEl);
    }

    if (question.type === 'textarea') {
      const textarea = document.createElement('textarea');
      textarea.name = question.name;
      textarea.id = question.name;
      textarea.required = true;
      textarea.value = formState[question.name] || '';
      stepDiv.appendChild(textarea);
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

        if (question.icons && question.icons[idx]) {
          const iconSpan = document.createElement('span');
          iconSpan.classList.add('material-symbols-outlined');
          iconSpan.textContent = question.icons[idx];
          radioLabel.appendChild(iconSpan);
        }

        const labelText = document.createElement('span');
        labelText.classList.add('label-text');
        labelText.textContent = option;

        radioLabel.appendChild(labelText);
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