'use strict';

const handleShowToken = (name) =>
  new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "token", name }, (response) =>
      resolve(response)
    );
  });

const handleLastpdateNetflix = () =>
  new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "lastUpdateNetflix" }, (response) => {
      console.log(`response`, response);
      resolve(response);
    });
  });

const handleDisconnectAccountBS = () =>
  chrome.runtime.sendMessage({ type: "logout" }, () => checkConnection());

const handleConnectAccountBS = () =>
  chrome.tabs.update({
    url:
      config.url_redirect +
      "/authorize?client_id=" +
      config.app.api_key +
      "&redirect_uri=" +
      config.url_redirect,
  });
