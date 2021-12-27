function checkConnection() {
  handleShowToken("bsat").then((res) => {
    if (res) {
      document.getElementById("logoutAccountBS").style.display = "none";
      document.getElementById("loggedAccountBS").style.display = "block";
    } else {
      document.getElementById("logoutAccountBS").style.display = "block";
      document.getElementById("loggedAccountBS").style.display = "none";
    }
  });
}

function definedListenere(target, cb) {
  if (document.getElementById(target))
    return document
      .getElementById(target)
      .addEventListener("click", function () {
        cb();
      });
  return null;
}

window.onload = function () {
  checkConnection();
  config.listListener.map((item) =>
    definedListenere(item.target, item.callback)
  );
  document.querySelectorAll("[data-trans]").forEach((item) => {
    item.innerHTML = chrome.i18n.getMessage(item.dataset.trans);
  });
};
