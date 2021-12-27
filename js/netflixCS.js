;(function() {
  'use strict';
  console.log('chargement du script content sur Netflix');

/*   let ext = {};

  ext._EventTarget = class EventTarget
  {
    constructor()
    {
      this._listeners = new Set();
    }

    addListener(listener)
    {
      this._listeners.add(listener);
    }

    removeListener(listener)
    {
      this._listeners.delete(listener);
    }

    _dispatch(...args)
    {
      let results = [];
      for (let listener of this._listeners)
        results.push(listener(...args));
      return results;
    }
  };
  if (!chrome.runtime.onMessage) {
    chrome.runtime.onMessage = new ext._EventTarget();
  } */

  /**
   * Retourne l'identifiant de la version de l'API Netflix shakti
   * @returns {string} L'identifiant du build de l'API Netflix
   */
  function getBuildId() {
    let scripts = document.getElementsByTagName('script'),
        re = new RegExp('"BUILD_IDENTIFIER":\s*"([^"]*)"', 'gi'),
        script, result, buildId;
    for (let s=0; s < scripts.length; s++) {
      if (scripts[s].src === '' || /netflix.reactContext/.test(scripts[s].innerText)) {
        script = scripts[s];
        break;
      }
    }
    if (script) {
      result = re.exec(script.innerText);
      if (result && result.length === 2) {
        buildId = result[1];
      }
    }
    return buildId;
  }
  /**
   * @typedef {Object} Profile
   * @property {string} guid - L'identifiant du profile
   * @property {string} name - Le nom du profile
   * @property {string} language - La locale du profile
   */
  /**
   * Retourne les profiles trouvés sur Netflix
   * @returns {Array<Profile>}
   */
  function getProfileList() {
    let scripts = document.getElementsByTagName('script'),
        re = new RegExp('netflix.falcorCache = (.*);', 'gi'),
        script, result, data;
    for (let s=0; s < scripts.length; s++) {
      if (scripts[s].src === '' && /netflix.falcorCache/.test(scripts[s].innerText)) {
        script = scripts[s];
        break;
      }
    }
    if (script) {
      result = re.exec(script.innerText);
      if (result && result.length === 2) {
        data = result[1].replaceAll(/\\x[0-9a-f]{2}/ig, '');
        data = JSON.parse(data);
      }
    }

    if (!data)
      return [];

    let profiles = [],
        profile,
        profileList = data.profiles;

    for (let guid in profileList) {
      profile = profileList[guid].summary.value;
      if (!profile.isActive) continue;
      profiles.push({
        guid: profile.guid,
        name: profile.profileName,
        language: profile.language
      });
    }
    return profiles;
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('netflix onMessage request', request, sender);
    if (request.type === 'buildId' && request.service === 'netflix') {
      let buildId = getBuildId();
      console.log('netflix buildId: ', buildId);
      sendResponse({ buildId: buildId });
    }
    else if (request.type === 'guid' && request.service === 'netflix') {
      let profiles = getProfileList();
      console.log('netflix profiles: ', profiles);
      sendResponse({ profiles: profiles });
    }
  });
})();
