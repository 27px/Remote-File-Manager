let _=s=>document.querySelector(s);

window.onload=()=>{
  _(".win-close").addEventListener("click", event => {
    window.main.close();
  });
  _(".win-minimize").addEventListener("click", event => {
    window.main.minimize();
  });
};
