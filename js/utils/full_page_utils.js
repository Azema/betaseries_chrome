const displayDate = (date) => {
  const timestamp = date * 1000;
  const DateFormat = new Date(timestamp);
  const day = DateFormat.getDate();
  const month = DateFormat.getMonth() + 1;
  const year = DateFormat.getFullYear();

  return `${day}/${month}/${year}`;
};

function actionModal(open) {
  document.getElementById("container-modal").style.display = open
    ? "block"
    : "none";
}

const displayLastUpdate = (timeUpdate) =>
  timeUpdate && timeUpdate !== "0"
    ? displayDate(timeUpdate)
    : trans("thumbnails.label.never-synced");

const handleOpenSettingsSynchro = () =>
  chrome.runtime.sendMessage({ type: "openSettings" }, () => {});

const servviceEnabled = () =>
  config.services.filter((service) => service.enabled);
