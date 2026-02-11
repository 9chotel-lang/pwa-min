const counterElement = document.querySelector('.counter');
const incrementButton = document.getElementById('incrementButton');

let count = Number(localStorage.getItem('count') ?? 0);

const render = () => {
  counterElement.textContent = String(count);
};

incrementButton.addEventListener('click', () => {
  count += 1;
  localStorage.setItem('count', String(count));
  render();
});

render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('./sw.js');
      console.log('Service Worker registered');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
}
