document.addEventListener('DOMContentLoaded', () => {

  // STEP 1: Define your form questions
  const formQuestions = [
    {
      title: 'How did you hear about us?',
      description: 'Tell us more.',
      name: 'referral',
      type: 'radio',
      options: ['Friend', 'Twitter', 'Newsletter', 'Other']
    },
    {
      title: 'Your Name',
      description: 'What’s your full name?',
      name: 'name',
      type: 'text'
    },
    {
      title: 'Email Address',
      description: 'Where can we reach you?',
      name: 'email',
      type: 'email'
    },
    {
      title: 'Ambition',
      description: 'Describe the goal you want to work toward.',
      name: 'goal',
      type: 'textarea'
    }
  ];

  // STEP 2: Get references to DOM elements
  const form = document.getElementById('join-form');
  const container = document.getElementById('form-steps-container');

  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const submitBtn = document.getElementById('submit-btn');

  // STEP 3: Dynamically build the form steps
  formQuestions.forEach((question, index) => {
    const stepDiv = document.createElement('div');
    stepDiv.classList.add('form-step');

    // Create and append the label (acts as your title)
    const labelEl = document.createElement('label');
    labelEl.setAttribute('for', question.name);
    labelEl.textContent = question.title;
    stepDiv.appendChild(labelEl);

    // Create and append the description div if provided
    if (question.description && question.description.trim() !== '') {
      const descEl = document.createElement('div');
      descEl.classList.add('description');
      descEl.textContent = question.description;
      stepDiv.appendChild(descEl);
    }

    // Add the input element(s)
    if (question.type === 'textarea') {
      const textarea = document.createElement('textarea');
      textarea.name = question.name;
      textarea.id = question.name;
      textarea.required = true;
      stepDiv.appendChild(textarea);

    } else if (question.type === 'radio') {
      question.options.forEach(option => {
        const radioWrapper = document.createElement('div');
        radioWrapper.classList.add('radio-option');

        const radioInput = document.createElement('input');
        radioInput.type = 'radio';
        radioInput.name = question.name;
        radioInput.value = option;
        radioInput.id = `${question.name}-${option}`;

        const radioLabel = document.createElement('label');
        radioLabel.setAttribute('for', radioInput.id);
        radioLabel.textContent = option;

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
      stepDiv.appendChild(input);
    }

    container.appendChild(stepDiv);
  });

  // STEP 4: Initialize steps and state
  const steps = Array.from(document.querySelectorAll('.form-step'));
  let formState = {};
  let currentStep = 0;
  let maxStepReached = 0;

  // STEP 5: Show a specific step and update progress
  function showStep(index) {
    steps.forEach((step, i) => {
      if (i === index) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });

    validateCurrentStep();

    const currentInputs = steps[currentStep].querySelectorAll('input, textarea, select');
    currentInputs.forEach(input => {
      input.addEventListener('input', validateCurrentStep);
      input.addEventListener('change', validateCurrentStep);
    });

    nextBtn.style.display = index < steps.length - 1 ? 'inline-block' : 'none';
    submitBtn.style.display = index === steps.length - 1 ? 'inline-block' : 'none';

    // ✅ Update progress bar on each step change
    updateProgressBar();
  }

  // STEP 6: Update the progress bar
  function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    const totalSteps = steps.length;
    const progressPercent = ((currentStep + 1) / totalSteps) * 100;

    progressBar.style.width = `${progressPercent}%`;
  }

  // STEP 7: Save input values from current step into formState
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
  }

  // STEP 8: Validate current step inputs & update button states
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

    // ✅ Apply disabled class and disable buttons
    if (currentStep === steps.length - 1) {
      if (isValid) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('button-disabled');
      } else {
        submitBtn.disabled = true;
        submitBtn.classList.add('button-disabled');
      }
    } else {
      if (isValid) {
        nextBtn.disabled = false;
        nextBtn.classList.remove('button-disabled');
      } else {
        nextBtn.disabled = true;
        nextBtn.classList.add('button-disabled');
      }
    }
  }

  // STEP 9: Helper function to validate emails
  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // STEP 10: Navigation button handlers
  nextBtn.addEventListener('click', () => {
    saveStepData();

    if (currentStep < steps.length - 1) {
      currentStep++;
      if (currentStep > maxStepReached) {
        maxStepReached = currentStep;
      }
      showStep(currentStep);
    }
  });

  prevBtn.addEventListener('click', () => {
    saveStepData();

    if (currentStep === 0) {
      window.location.href = '/index.html';
    } else if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  });

  // STEP 11: Form submit handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveStepData();

    console.log('Form Submitted:', formState);

    fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
      method: 'POST',
      body: JSON.stringify(formState),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success!', data);
      alert('Thank you! Your form has been submitted.');

      form.reset();
      formState = {};
      currentStep = 0;
      maxStepReached = 0;
      showStep(currentStep);
    })
    .catch(error => {
      console.error('Error!', error);
      alert('There was a problem submitting the form.');
    });
  });

  // STEP 12: Custom radio option selection logic
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
      });
    });
  }

  // STEP 13: Initialize the first step and radios
  showStep(currentStep);
  setupCustomRadios();
});