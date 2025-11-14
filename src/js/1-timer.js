// 1-timer.js

import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";

import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";

const refs = {
  input: document.querySelector('#datetime-picker'),
  startBtn: document.querySelector('[data-start]'),
  days: document.querySelector('[data-days]'),
  hours: document.querySelector('[data-hours]'),
  minutes: document.querySelector('[data-minutes]'),
  seconds: document.querySelector('[data-seconds]'),
};

refs.startBtn.disabled = true;

let userSelectedDate = null;
let timerId = null;

const options = {
  enableTime: true,
  time_24hr: true,
  defaultDate: new Date(),
  minuteIncrement: 1,
  onClose(selectedDates) {
    const selectedDate = selectedDates[0];

    if (!selectedDate) {
      refs.startBtn.disabled = true;
      return;
    }

    const now = new Date();

    if (selectedDate <= now) {
      refs.startBtn.disabled = true;
      userSelectedDate = null;

      iziToast.error({
        title: 'Error',
        message: 'Please choose a date in the future',
        position: 'topRight',
        timeout: 3000,
      });

      return;
    }

    userSelectedDate = selectedDate;
    refs.startBtn.disabled = false;
  },
};

flatpickr(refs.input, options);

refs.startBtn.addEventListener('click', onStartClick);

function onStartClick() {
  if (!userSelectedDate) return;

  // блокуємо кнопку та інпут
  refs.startBtn.disabled = true;
  refs.input.disabled = true;

  // якщо таймер уже запущений — зупиняємо перед новим стартом (на всяк випадок)
  if (timerId) {
    clearInterval(timerId);
  }

  timerId = setInterval(() => {
    const now = new Date();
    const diff = userSelectedDate - now;

    if (diff <= 0) {
      clearInterval(timerId);
      timerId = null;
      updateTimerInterface({ days: 0, hours: 0, minutes: 0, seconds: 0 });

      // після завершення таймера інпут знову активний, кнопку розблокує новий вибір майбутньої дати
      refs.input.disabled = false;
      return;
    }

    const time = convertMs(diff);
    updateTimerInterface(time);
  }, 1000);
}

function updateTimerInterface({ days, hours, minutes, seconds }) {
  refs.days.textContent = addLeadingZero(days);
  refs.hours.textContent = addLeadingZero(hours);
  refs.minutes.textContent = addLeadingZero(minutes);
  refs.seconds.textContent = addLeadingZero(seconds);
}

function addLeadingZero(value) {
  return String(value).padStart(2, '0');
}

function convertMs(ms) {
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  const days = Math.floor(ms / day);
  const hours = Math.floor((ms % day) / hour);
  const minutes = Math.floor(((ms % day) % hour) / minute);
  const seconds = Math.floor((((ms % day) % hour) % minute) / second);

  return { days, hours, minutes, seconds };
}
