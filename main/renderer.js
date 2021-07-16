let _ = (s) => document.querySelector(s);

window.onload = () => {
  _(".win-close")?.addEventListener("click", (event) => {
    window?.main?.close();
  });
  _(".win-minimize")?.addEventListener("click", (event) => {
    window?.main?.minimize();
  });
  _(".win-maximize")?.addEventListener("click", (event) => {
    window?.main?.maximize();
  });
};
