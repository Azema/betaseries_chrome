const readCookies = (name) =>
  new Promise((resolve) => {
    chrome.cookies.getAll({ name }, function (r) {
      let response = null;
      if (r && r[0]) {
        response = r[0];
      }
      resolve(response);
    });
  });

const createNetflix = () => {
  chrome.alarms.clear("alarm_netflix");
  chrome.alarms.create("alarm_netflix", {
    delayInMinutes: 1 * 60,
    periodInMinutes: 1 * 60,
  });
};

const readStorage = (key) =>
  new Promise(async (resolve) => {
    const storage = await localStorage.get(key);
    resolve(storage);
  });

const resetStorage = () =>
  new Promise((resolve) => {
    localStorage.clear(() => resolve(true));
  });

function checkCookies(serviceName) {
  if (
    !config ||
    !config.listCookies ||
    !config.listCookies[serviceName] ||
    config.listCookies[serviceName].length === 0
  )
    return null;

  return config.listCookies[serviceName].map((item) => readCookies(item));
}
function forceUpdate(service) {
  if (service === "netflix") {
    callNetflixGuidAccount().then((dataSyncNetflix) => {
      if (dataSyncNetflix?.guid?.length > 0) {
        callLastActivityNetflix(dataSyncNetflix.guid);
      }
      return dataSyncNetflix.last_update;
    });
  }
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm?.name === "alarm_netflix") {
    callNetflixGuidAccount().then((dataSyncNetflix) => {
      if (dataSyncNetflix?.guid?.length > 0) {
        callLastActivityNetflix(dataSyncNetflix.guid);
      }
    });
  }
});

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.type == "lastUpdateNetflix") {
    localStorage.get("last_update_netflix").then((resp) => sendResponse(resp));
    return true;
  }
  if (request.type == "forceUpdateNetflix") {
    createNetflix();
    const dataLastUpdateNetflix = forceUpdate("netflix");
    sendResponse(dataLastUpdateNetflix);
    return true;
  }
  if (request.type == "checkCookie") {
    Promise.all(checkCookies(request.name))
      .then((cookies) => {
        const checkAllCookies = cookies.filter((item) => item !== null);
        if (cookies.length !== checkAllCookies.length)
          return sendResponse(null);
        const cookiesCompute = checkAllCookies.reduce(
          (acc, item) => ({ ...acc, [item.name]: item.value }),
          {}
        );
        if (request.name === "netflix") {
          callNetflixHome().then((rep) => {
            callNetflixProfiles(checkAllCookies, rep)
              .then((retour) => sendResponse(retour))
              .catch((err) => {
                console.log(`err callNetflixHOME`, err);
                return sendResponse(null);
              });
          });

          return;
        } else if (request.name === "arte") {
          callArteSync(cookiesCompute["lr-user--token"]).then((r) => {
            sendResponse(r);
          });
          return true;
        } else {
          sendResponse(null);
        }
      })
      .catch((error) => sendResponse(null));
    return true;
  }
  if (request.type === "netflixSync") {
    createNetflix();
    callNetflixSync(request.cookie, request.guid, request.profile).then((r) => {
      sendResponse(r);
    });
    return true;
  }
  if (request.type === "token") {
    readStorage(request.name).then((res) => {
      sendResponse(res);
    });
    return true;
  }
  if (request.type === "openSettings") {
    chrome.tabs.create({
      url: chrome.extension.getURL("full_page.html"),
    });
    sendResponse("open");
    return true;
  }
  if (request.type === "logout") {
    resetStorage().then(() => {
      sendResponse("LOGOUT");
    });
    return true;
  }
  if (request.type === "callCheckSynchroPlatform") {
    callCheckSynchroPlatform(request.access_token, request.platform).then(
      (res) => {
        if (request.platform === "netflix" && res?.profile?.length > 0) {
          createNetflix();
          sendResponse(true);
        } else if (request.platform === "arte" && res?.email?.length > 0) {
          sendResponse(true);
        } else {
          sendResponse(false);
        }
      }
    );
    return true;
  }
  if (request.type === 'request_profiles_netflix') {
    chrome.tabs.query({url: '*://*.netflix.com/*'}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: "guid", service: 'netflix'}, function(response) {
        console.log(response);
        sendResponse(response);
      });
    });
    return true;
  }
  if (request.type === "callRemovePlatformSVOD") {
    callRemovePlatformSVOD(request.platform).then((res) => sendResponse(res));
    return true;
  }
});

chrome.tabs.onUpdated.addListener((r, changeInfo, tab) => {
  if (
    changeInfo &&
    changeInfo.status === "complete" &&
    tab &&
    tab.url.includes(config.url_redirect + "/?code=")
  ) {
    const parserUrl = (url) => {
      var regExp = /www.betaseries.com\/\?code=([\d\w]*)/;
      var match = url.match(regExp);
      if (match && match[1]) {
        return match[1];
      }
    };
    let url = tab.url;
    let formData = new FormData();
    formData.append("client_id", config.app.api_key);
    formData.append("client_secret", config.app.secret_key);
    formData.append("redirect_uri", config.url_redirect);
    formData.append("code", parserUrl(url));
    fetch(config.api + "/oauth/access_token", {
      method: "POST",
      body: formData,
      headers: new Headers({ "X-BetaSeries-Key": config.app.api_key }),
      mode: "cors",
    })
      .then((rep) => rep.json())
      .then((res) => {
        if (res && res.access_token.length > 0) {
          localStorage.set("bsat", res.access_token, () =>
            chrome.tabs.create({
              url: chrome.extension.getURL("full_page.html"),
            })
          );
        }
      });
  }
});

chrome.browserAction.onClicked.addListener(function (activeTab) {
  chrome.tabs.create({ url: chrome.extension.getURL("full_page.html") });
});
