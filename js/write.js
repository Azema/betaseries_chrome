const launchTranslate = () => {
  document.querySelectorAll("[data-trans]").forEach((item) => {
    const translate = trans(item.dataset.trans);
    if (translate !== item.dataset.trans) item.innerHTML = translate;
  });
};
