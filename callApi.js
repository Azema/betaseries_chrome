'use strict';

function callCheckSynchroPlatform(access_token, platform) {
  return new Promise((resolve) => {
    fetch(config.api + "/sync/" + platform, {
      method: "GET",
      headers: new Headers({
        "X-BetaSeries-Key": config.app.api_key,
        "X-BetaSeries-Token": access_token,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((resp) => {
        if (platform === "netflix") {
          localStorage.set("last_update_netflix", resp.last_update);
        }
        resolve(resp);
      });
  });
}

function callRemovePlatformSVOD(platform) {
  return new Promise((resolve) => {
    readStorage("bsat").then((access_token) => {
      fetch(config.api + "/sync/" + platform, {
        method: "DELETE",
        headers: new Headers({
          "X-BetaSeries-Key": config.app.api_key,
          "X-BetaSeries-Token": access_token,
        }),
      })
        .then((res) => {
          return res.json();
        })
        .then((resp) => {
          resolve(resp);
        });
    });
  });
}

// function callNetflixProfiles(netflixId, secureNetflixId) {
function callNetflixProfiles(cookiesList, html) {
  return new Promise((resolve) => {
    readStorage("bsat").then((res) => {
      let formData = new FormData();
      let cookiesString = "";
      cookiesList.forEach((c, i) => {
        cookiesString += `${c.name}=${c.value}${
          cookiesList.length - 1 !== i ? "; " : ""
        }`;
      });
      formData.append("cookie", cookiesString);
      formData.append("html", html);

      fetch(config.api + "/sync/netflix_profiles", {
        method: "POST",
        headers: new Headers({
          "X-BetaSeries-Key": config.app.api_key,
          "X-BetaSeries-Token": res,
        }),
        body: formData,
      })
        .then((res) => res.json())
        .then((resp) => {
          resolve(resp);
        });
    });
  });
}
function callNetflixApi() {
  return new Promise((resolve, reject) => {
    fetch(
      `https://www.netflix.com/api/shakti/${config.services[0].buildId}/viewingactivity?pg=0&pgSize=20`
    )
      .then((resp) => {
        if (resp.status === 404) {
          callContentScriptNetflix({ type: "buildId", service: 'netflix' }, (err) => {
            if (err) {
              console.warn(err);
              reject("erreur connexion");
              return;
            }
            callNetflixApi().then(res => resolve(res), err => reject(err));
            return;
          });
        } else if (resp.status !== 200) {
          reject("erreur connexion");
          return;
        }
        return resp.json();
      })
      .then((e) => resolve(e))
      .catch((err) => reject(err));
  });
}
function callNetflixHome() {
  return new Promise((resolve, reject) => {
    fetch("https://www.netflix.com/browse")
      .then((resp) => resp.text())
      .then((e) => {
        const data = e
          .match(/<script>window.netflix(.*?)<\/script>/gm)
          .find((i) => i.match("profilesList"));
        if (!data) return reject();
        return resolve(data);
      })
      .catch((err) => reject(err));
  });
}

function callNetflixGuidAccount() {
  return new Promise((resolve) => {
    readStorage("bsat").then((res) => {
      fetch(config.api + "/sync/netflix", {
        method: "GET",
        headers: new Headers({
          "X-BetaSeries-Key": config.app.api_key,
          "X-BetaSeries-Token": res,
        }),
      })
        .then((res) => res.json())
        .then((resp) => {
          localStorage.set("last_update_netflix", resp.last_update);

          resolve(resp);
        });
    });
  });
}
function callNetflixActivity(jsonNetflix) {
  return new Promise((resolve) => {
    readStorage("bsat").then((res) => {
      let formData = new FormData();
      formData.append("json", JSON.stringify(jsonNetflix));
      fetch(config.api + "/sync/netflix_activity", {
        method: "POST",
        headers: new Headers({
          "X-BetaSeries-Key": config.app.api_key,
          "X-BetaSeries-Token": res,
        }),
        body: formData,
      })
        .then((res) => {
          return res.json();
        })
        .then((resp) => {
          // console.log('response from callNetflixActivity', resp);
          resolve(resp);
        });
    });
  });
}

function getTabNetflix() {
  return new Promise((resolve) => {
    chrome.tabs.query({url: 'https://*.netflix.com/*'}, (tabs) => resolve(tabs));
  });
}

function callContentScriptNetflix(data, cb) {
  getTabNetflix().then(tabs => {
    console.log('tabs', tabs);
    if (tabs.length <= 0) {
      return cb('Aucun onglet Netflix trouvé');
    }
    let tab = tabs[0];
    chrome.tabs.executeScript(tab.id, {
      code: `;(function() {
            let scripts = document.getElementsByTagName('script'),
                re = new RegExp('"BUILD_IDENTIFIER":\s*"([^"]*)"', 'gi'),
                netScript, result, buildId;
            // console.log('%d scripts found', scripts.length);
            for (let s=0; s < scripts.length; s++) {
              if (scripts[s].src === '' && /netflix.reactContext/.test(scripts[s].innerText)) {
                netScript = scripts[s];
                break;
              }
            }
            if (netScript) {
              // console.log('script netflix found');
              result = re.exec(netScript.innerText);
              if (result && result.length === 2) {
                buildId = result[1];
                // console.log('buildId found', buildId);
              } else {
                console.log('result', result, netScript.innerText);
              }
            }
            return buildId;
          })();`
    }, (result) => {
      console.log('result', result);
      if (result && result.length > 0 && result[0] != null) {
        config.services[0].buildId = result[0];
        localStorage.set('buildId', result[0]);
        return cb();
      }
    });
  });
}

function callNetflixAPIActivity(guid, page = 0) {
  return new Promise((resolve, reject) => {
    fetch(
      `https://www.netflix.com/api/shakti/${config.services[0].buildId}/viewingactivity?pg=${page}&pgSize=20&guid=${guid}`,
      {
        method: "GET",
      }
    )
      .then((res) => {
        // Il faut verifier le buildId
        if (res.status === 404) {
          callContentScriptNetflix({ type: "buildId", service: 'netflix' }, (err) => {
            if (err) {
              console.warn(err);
              reject("erreur connexion et de récupération du buildId: " + err);
              return;
            }
            callNetflixAPIActivity(guid, page).then(res => {
              // console.log('second call', config.services[0].buildId, res);
              resolve(res);
            }, err => {
              console.warn('Erreur second call', err);
              reject(err);
            });
          });
        } else if (! res.ok) {
          reject('erreur connexion');
          return;
        } else {
          resolve(res.json());
        }
      });
  });
}

function callNetflixSync(cookie, guid, profile) {
  return new Promise((resolve) => {
    readStorage("bsat").then((res) => {
      let formData = new FormData();
      formData.append("cookie", cookie);
      formData.append("guid", guid);
      formData.append("profile", profile);
      fetch(config.api + "/sync/netflix", {
        method: "POST",
        headers: new Headers({
          "X-BetaSeries-Key": config.app.api_key,
          "X-BetaSeries-Token": res,
        }),
        body: formData,
      })
        .then((res) => {
          return res.json();
        })
        .then((resp) => {
          localStorage.set("last_update_netflix", resp.last_update);
          resolve(resp);
        });
    });
  });
}

function callArteSync(token) {
  return new Promise((resolve) => {
    readStorage("bsat").then((res) => {
      let formData = new FormData();
      formData.append("token", token);
      fetch(config.api + "/sync/arte", {
        method: "POST",
        headers: new Headers({
          "X-BetaSeries-Key": config.app.api_key,
          "X-BetaSeries-Token": res,
        }),
        body: formData,
      })
        .then((res) => {
          return res.json();
        })
        .then((resp) => {
          resolve(resp);
        });
    });
  });
}
