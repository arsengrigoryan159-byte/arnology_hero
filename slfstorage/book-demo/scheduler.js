import { externalLinks } from '../config.js';

const form = document.querySelector('[data-demo-form]');
const dateOptions = document.querySelector('[data-date-options]');
const timeOptions = [...document.querySelectorAll('[data-time]')];
const dateInput = document.querySelector('[data-date-input]');
const timeInput = document.querySelector('[data-time-input]');
const timezoneInput = document.querySelector('[data-timezone-input]');
const timezoneLabel = document.querySelector('[data-timezone-label]');
const summary = document.querySelector('[data-request-summary]');
const submitButton = document.querySelector('[data-submit-button]');
const errorPanel = document.querySelector('[data-form-error]');
const successPanel = document.querySelector('[data-success-panel]');
const successCopy = document.querySelector('[data-success-copy]');
const newRequestButton = document.querySelector('[data-new-request]');

const state = {
  date: '',
  dateLabel: '',
  time: '',
  timeLabel: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time'
};

function configureSignIn() {
  document.querySelectorAll('[data-external="app"]').forEach((link) => {
    if (!externalLinks.app) {
      link.addEventListener('click', (event) => event.preventDefault());
      return;
    }
    link.href = externalLinks.app;
    link.classList.remove('is-disabled');
    link.removeAttribute('aria-disabled');
    link.removeAttribute('tabindex');
    link.removeAttribute('title');
  });
}

function toLocalIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getUpcomingWeekdays(count) {
  const dates = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  cursor.setDate(cursor.getDate() + 1);

  while (dates.length < count) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function renderDates() {
  const dayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
  const monthFormatter = new Intl.DateTimeFormat(undefined, { month: 'short' });
  const fullFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  getUpcomingWeekdays(8).forEach((date) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'date-option';
    button.dataset.date = toLocalIsoDate(date);
    button.dataset.label = fullFormatter.format(date);
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', `Choose ${fullFormatter.format(date)}`);
    button.innerHTML = `<span>${dayFormatter.format(date)}</span><strong>${date.getDate()}</strong><small>${monthFormatter.format(date)}</small>`;
    dateOptions.append(button);
  });
}

function updateSummary() {
  dateInput.value = state.date;
  timeInput.value = state.time;
  timezoneInput.value = state.timezone;
  timezoneLabel.textContent = state.timezone;
  submitButton.disabled = !(state.date && state.time);

  if (state.date && state.time) {
    summary.textContent = `${state.dateLabel} at ${state.timeLabel}`;
  } else if (state.date) {
    summary.textContent = `${state.dateLabel} · choose a time`;
  } else {
    summary.textContent = 'Choose a date and time';
  }
}

function clearError() {
  errorPanel.hidden = true;
  errorPanel.textContent = '';
}

dateOptions.addEventListener('click', (event) => {
  const button = event.target.closest('[data-date]');
  if (!button) return;
  dateOptions.querySelectorAll('[data-date]').forEach((option) => {
    const selected = option === button;
    option.classList.toggle('is-selected', selected);
    option.setAttribute('aria-pressed', String(selected));
  });
  state.date = button.dataset.date;
  state.dateLabel = button.dataset.label;
  clearError();
  updateSummary();
});

timeOptions.forEach((button) => {
  button.addEventListener('click', () => {
    timeOptions.forEach((option) => {
      const selected = option === button;
      option.classList.toggle('is-selected', selected);
      option.setAttribute('aria-pressed', String(selected));
    });
    state.time = button.dataset.time;
    state.timeLabel = button.textContent.trim();
    clearError();
    updateSummary();
  });
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError();

  if (!state.date || !state.time) {
    errorPanel.textContent = 'Choose a preferred date and time before continuing.';
    errorPanel.hidden = false;
    return;
  }

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const payload = Object.fromEntries(new FormData(form).entries());
  submitButton.disabled = true;
  submitButton.classList.add('is-loading');
  submitButton.firstChild.textContent = 'Sending request ';

  try {
    const response = await fetch('/api/demo-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || 'The request could not be sent right now. Please try again later.');

    form.hidden = true;
    successPanel.hidden = false;
    successCopy.textContent = `${state.dateLabel} at ${state.timeLabel} (${state.timezone}) is your preferred slot. We’ll use the email you supplied to confirm it.`;
    successPanel.focus();
  } catch (error) {
    errorPanel.textContent = error.message;
    errorPanel.hidden = false;
    errorPanel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  } finally {
    submitButton.classList.remove('is-loading');
    submitButton.firstChild.textContent = 'Request this time ';
    updateSummary();
  }
});

newRequestButton.addEventListener('click', () => {
  form.reset();
  state.date = '';
  state.dateLabel = '';
  state.time = '';
  state.timeLabel = '';
  dateOptions.querySelectorAll('button').forEach((button) => {
    button.classList.remove('is-selected');
    button.setAttribute('aria-pressed', 'false');
  });
  timeOptions.forEach((button) => {
    button.classList.remove('is-selected');
    button.setAttribute('aria-pressed', 'false');
  });
  successPanel.hidden = true;
  form.hidden = false;
  clearError();
  updateSummary();
  form.querySelector('[data-date]')?.focus();
});

configureSignIn();
renderDates();
updateSummary();
