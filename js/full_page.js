chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm?.name === "alarm_netflix") {
    setTimeout(async () => {
      const last_update = await handleLastpdateNetflix();
      const displayDateFormat = displayLastUpdate(last_update);
      document.querySelector("span[data-last-update-netflix]").innerHTML =
        displayDateFormat;
    }, 2000);
  }
});

function handleActionAccount(element) {
  const { actionType, actionTarget } = element.target.dataset;
  if (!actionType || !actionTarget) return null;
  chrome.runtime.sendMessage(
    {
      type: "callRemovePlatformSVOD",
      platform: actionTarget,
    },
    function (response) {
      if (actionType === "reload") {
        launchSynchro(actionTarget);
        checkConnection();
      } else if (actionType === "disconnect") {
        actionModal(true);
        modalContent(actionTarget, "disconnectOK");
        checkConnection();
      }
    }
  );
}

function handleForceNetflix() {
  const containerSpinner = document.querySelector(
    'div[data-platform="netflix"] span.container-spinner'
  );
  if (containerSpinner) containerSpinner.style.display = "flex";
  chrome.runtime.sendMessage(
    {
      type: "forceUpdateNetflix",
    },
    function () {
      setTimeout(async () => {
        console.log("CHECK LAST UPDATE");
        const last_update = await handleLastpdateNetflix();
        const displayDateFormat = displayLastUpdate(last_update);
        document.querySelector("span[data-last-update-netflix]").innerHTML =
          displayDateFormat;
        if (containerSpinner) containerSpinner.style.display = "none";
      }, 2000);
    }
  );
}

function handleConnectProfilesNetflix(element) {
  if (
    !element ||
    !element.target ||
    !element.target.dataset ||
    !element.target.dataset.infoSync
  )
    return null;
  const data = JSON.parse(element.target.dataset.infoSync);
  chrome.runtime.sendMessage(
    {
      type: "netflixSync",
      cookie: data.cookie,
      guid: data.guid,
      profile: data.profile,
    },
    function (response) {
      if (response.profile?.length > 0 && response.errors?.length === 0) {
        modalContent("netflix", "syncOk", response.profile);
        checkConnection();
      } else {
        modalContent("netflix", "syncError", response.profile);
      }
    }
  );
}

function modalContent(target, type, data = []) {
  const d = document.createElement("span");
  const currentService = findServiceByTarget(target);
  d.innerHTML =
    "<h2 class='title-syncro'>" +
    trans("modal.synchronization.title") +
    " " +
    currentService.name +
    "</h2>";

  switch (type) {
    case "load":
      d.innerHTML += "<p>" + trans("modal.load-account") + "</p>";
      break;
    case "choice_profiles":
      const content_profiles = data.profiles.map(
        (item) =>
          "<li class='choice-profile' data-info-sync='" +
          JSON.stringify({
            profile: item.name,
            guid: item.guid,
            cookie: data.cookie,
          }) +
          "'>" +
          item.name +
          "</li>"
      );
      d.innerHTML +=
        "<p>" + trans("modal.choice-profiles.netflix.label") + "</p>";
      d.innerHTML += "<ul>" + content_profiles.join("") + "</ul>";
      break;
    case "syncOk":
      if (target === "netflix") {
        d.innerHTML +=
          "<p>" + trans("modal.syncOK.netflix", { "%login%": data }) + "</p>";
        handleForceNetflix();
      }
      if (target === "arte") {
        d.innerHTML += "<p>" + trans("modal.syncOK.arte") + "</p>";
      }
      setTimeout(function () {
        actionModal(false);
      }, 3000);
      break;
    case "emptyProfiles":
      d.innerHTML +=
        "<p>" +
        trans("modal.empty-profiles.netflix", {
          "%name%": currentService.name,
        }) +
        "</p>";
    case "errorCookies":
      d.innerHTML +=
        "<p>" +
        trans("modal.error-cookie", {
          "%name%": currentService.name,
          "%link%": currentService.link,
        }) +
        "</p>";
      break;
    case "disconnectOK":
      if (target === "netflix") {
        chrome.alarms.clear("alarm_netflix");
      }
      d.innerHTML += "<p>" + trans("modal.logout.label") + "</p>";
      setTimeout(function () {
        actionModal(false);
      }, 3000);
      break;
    default:
      break;
  }
  const container_modal = document.getElementById("content-modal");
  container_modal.innerHTML = "";
  container_modal.appendChild(d);
  document
    .querySelectorAll("ul>li.choice-profile")
    .forEach((item) =>
      item.addEventListener("click", (el) => handleConnectProfilesNetflix(el))
    );
}

function handleReadCookies(target, handler) {
  const hasSynchro = document.getElementById(handler).dataset.synchro === "yes";
  if (!hasSynchro) {
    launchSynchro(target);
  }
}
function launchSynchro(target) {
  actionModal(true);
  modalContent(target, "load");
  chrome.runtime.sendMessage(
    { type: "checkCookie", name: target },
    function (response) {
      if (response === null) {
        // Afficher message d'erreur pour inviter l'utilisateur à se rendre sur la page du service dans un nouvel onglet
        modalContent(target, "errorCookies");
        return;
      }
      if (target === "netflix") {
        if (response === "sync_ok") {
          modalContent(target, "syncOk");
        }
        if (response?.profiles?.length === 0) {
          // Afficher message d'erreur comme quoi on a pas de profiles retournés
          modalContent(target, "emptyProfiles");
          return;
        }
        modalContent(target, "choice_profiles", response);
        return;
      }
      if (target === "arte") {
        modalContent(target, "syncOk");
        checkConnection();
        return;
      }
    }
  );
}

function checkPlatformsConnected(access_token) {
  servviceEnabled().map((service) => {
    chrome.runtime.sendMessage(
      {
        type: "callCheckSynchroPlatform",
        access_token,
        platform: service.target,
      },
      async function (response) {
        if (response) {
          document.getElementById(service.handler).dataset.synchro = "yes";
          document.getElementById(service.handler).dataset.platform =
            service.target;
          document.getElementById("state-" + service.target).innerHTML = trans(
            "thumbnails.label.synchronized"
          );
          const d = document.createElement("span");
          d.className = "container-button-action-profiles";
          const last_update = await handleLastpdateNetflix();
          const displayDateFormat = displayLastUpdate(last_update);
          const forceSync =
            service.target === "netflix"
              ? "<br/><span>Dernière synchronisation :<br/><span data-last-update-netflix>" +
                displayDateFormat +
                "</span></span><br/><span id='forceSyncNetflix' class='action-force-reload' data-action-type='disconnect' data-action-target='" +
                service.target +
                "'>" +
                trans("thumbnails.label.forceing-sync") +
                "</span>"
              : "";
          d.innerHTML +=
            "<p><strong>" +
            service.name +
            "</strong><br/><span class='green' id='state-" +
            service.target +
            "'>" +
            trans("thumbnails.label.synced") +
            "</span> <span class='container-svg-action'><span class='action-profile' data-action-type='reload' data-action-target='" +
            service.target +
            "'></span><svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'><title>" +
            trans("thumbnails.label.resynchronized") +
            '</title><g fill="#3b73b2"><path d="M6,0A6,6,0,0,0,.5,3.6l1.832.8A4,4,0,0,1,6,2,3.946,3.946,0,0,1,8.794,3.172l-1.919,1.9L12,5.639V0L10.229,1.752A5.937,5.937,0,0,0,6,0Z" fill="#3b73b2"></path> <path d="M6,10A3.946,3.946,0,0,1,3.206,8.828l1.919-1.9L0,6.361V12l1.771-1.752A5.937,5.937,0,0,0,6,12a6,6,0,0,0,5.5-3.6L9.668,7.6A4,4,0,0,1,6,10Z"></path></g></svg></span> ' +
            "<span class='container-svg-action'><span class='action-profile' data-action-type='disconnect' data-action-target='" +
            service.target +
            "'></span><svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'><title>" +
            trans("thumbnails.label.logout-account") +
            '</title><g fill="#e92b24"><path d="M10.707,1.293a1,1,0,0,0-1.414,0L6,4.586,2.707,1.293A1,1,0,0,0,1.293,2.707L4.586,6,1.293,9.293a1,1,0,1,0,1.414,1.414L6,7.414l3.293,3.293a1,1,0,0,0,1.414-1.414L7.414,6l3.293-3.293A1,1,0,0,0,10.707,1.293Z" fill="#e92b24"></path></g></svg></span>' +
            forceSync +
            "<span class='container-spinner'><img src='images/loading.gif' alt='loading'/></span></p>";
          document
            .querySelector("#" + service.handler)
            .removeChild(
              document.querySelector("#" + service.handler + ">span")
            );
          document.querySelector("#" + service.handler).appendChild(d);
          d.querySelectorAll("span.action-profile").forEach((item) =>
            item.addEventListener("click", (el) => handleActionAccount(el))
          );
          d.querySelector("#forceSyncNetflix") &&
            d
              .querySelector("#forceSyncNetflix")
              .addEventListener("click", () => handleForceNetflix());
        } else {
          // redraw thumbnails disconnected
          const d = document.createElement("span");
          d.innerHTML =
            "<p><strong>" +
            service.name +
            "</strong><br />" +
            "<span id='state-" +
            service.target +
            "'><a href='#'>" +
            trans("thumbnails.label.sync") +
            "</a></span></p>";
          document
            .querySelector("#" + service.handler)
            .removeChild(
              document.querySelector("#" + service.handler + ">span")
            );
          document.querySelector("#" + service.handler).appendChild(d);
          document.getElementById(service.handler).dataset.synchro = "no";
        }
      }
    );
  });
}

function checkConnection() {
  handleShowToken("bsat").then((res) => {
    if (res) {
      checkPlatformsConnected(res);
      document.getElementById("logged").style.display = "block";
      document.getElementById("connect").style.display = "none";
    } else {
      document.getElementById("logged").style.display = "none";
      document.getElementById("connect").style.display = "block";
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

function displayItemListPlatforms() {
  servviceEnabled().forEach((item) => {
    const d = document.createElement("div");
    d.className = "item-list-platforms";
    d.innerHTML =
      " <div id='" +
      item.handler +
      "' class='thumbnail-item-platform' data-synchro='no'><img src='/images/" +
      item.target +
      ".jpg' alt='" +
      item.name +
      "' /><span><p><strong>" +
      item.name +
      "</strong><br/><span id='state-" +
      item.target +
      "' class='loading'>" +
      trans("thumbnails.label.loading") +
      "</span></p></span></div>";
    if (document.getElementById("container-list-platforms"))
      document.getElementById("container-list-platforms").appendChild(d);
  });
}

function findServiceByTarget(target) {
  const services = config.services.filter(
    (service) => service.target === target
  );
  if (services && services[0]) {
    return services[0];
  }
  return undefined;
}

window.onload = function () {
  displayItemListPlatforms();
  checkConnection();
  config.listListener.map((item) =>
    definedListenere(item.target, item.callback)
  );

  let lang = "fr-FR";
  const language_enabled = ["fr-FR", "en-US"];
  if (language_enabled.includes(navigator.language)) lang = navigator.language;

  document.head.innerHTML +=
    "<script type='text/javascript' src='/_locales/translation_" +
    lang +
    ".js'></script>";
  document.head.innerHTML +=
    "<script type='text/javascript' src='translator.js'></script>";
  launchTranslate();
  document.getElementById('checkProfilesNetflix').addEventListener('click', function(event) {
    event.stopPropagation();
    event.preventDefault();
    chrome.runtime.sendMessage(
    { type: "request_profiles_netflix", name: 'netflix' },
    function (response) {
      console.log('response checkProfilesNetflix', response);
    });
  })
};
