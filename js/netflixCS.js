;(function(history) {
  'use strict';
  console.log('chargement du script content sur Netflix');
  const pushState = history.pushState;
  history.pushState = function(state) {
    console.log('history pushState', state);
      if (typeof history.onpushstate === "function") {
          history.onpushstate({state: state});
      }
      // ... whatever else you want to do
      // maybe call onhashchange e.handler
      return pushState.apply(history, arguments);
  };
  // const watchPlayer = document.getElementsByClassName('watch-video')[0];
  const watchPlayer = document.getElementsByClassName('netflix-sans-font-loaded')[0];
  if (watchPlayer) {
    /**
     * @type {HTMLVideoElement}
     */
    let video = null;
    let data = {
      title: null,
      season: null,
      episode: null,
      container: null,
      send: false
    };
    const evtPlay = (e) => {
      console.log('Video play: ', e, data);
    };
    const evtPause = (e) => {
      console.log('Video pause: ', e, data);
    };
    const evtProgress = (e) => {
      if (data.title == null || data.title == '') return;
      const percent = (video.currentTime * 100) / video.duration;
      if (!data.send && percent >= 90) {
        data.send = true;
        console.log('Video progress, percent: %d', percent);
        // Envoyer l'info à l'extension
        chrome.runtime.sendMessage({type: 'playend', data});
      }
    };
    const loadVideo = function() {
      let counter = 0;
      let timer = setInterval(() => {
        if (++counter >= 40) {
          clearInterval(timer);
          return;
        }
        if (document.getElementsByTagName('video').length > 0) {
          initVideo(document.getElementsByTagName('video')[0]);
          clearInterval(timer);
        }
      }, 250);
    };
    const initEvents = function(video) {
      console.log('video initEvents');
      if (video.addEventListener) {
        video.addEventListener('play', evtPlay);
        video.addEventListener('pause', evtPause);
        video.addEventListener('progress', evtProgress);
        return true;
      }
      return false;
    }
    /**
     * Initialize l'objet video pour y ajouter les events play, pause et progress
     * @param {HTMLVideoElement} vid - Le noeud video
     * @returns
     */
    const initVideo = function(vid) {
      console.log('initVideo ', vid, vid.src);
      if (vid === null || vid === undefined || vid.nodeName !== 'VIDEO') return;
      if (video && video.removeEventListener) {
        video.removeEventListener('play', evtPlay);
        video.removeEventListener('pause', evtPause);
        video.removeEventListener('progress', evtProgress);
      }
      video = vid;

      let timer = setInterval(() => {
        if (initEvents(video)) {
          clearInterval(timer);
        }
      }, 100);
    };
    const observer = new MutationObserver(mutationsList => {
      // console.log('mutationsList', mutationsList);
      /**
       * @type {HTMLElement}
       */
      let elt;
      for (let mutation of mutationsList) {
        if (mutation.type == 'childList') {
          if (mutation.addedNodes.length === 1 && mutation.target.nodeName === 'DIV' && mutation.target.className === '' && mutation.target.id === '' && mutation.addedNodes[0].nodeName === 'DIV' && mutation.addedNodes[0].childNodes[0].nodeName === 'VIDEO') {
            console.log('mutation video', mutation);
            data.send = false;
            data.container = null;
            initVideo(mutation.addedNodes[0].childNodes[0]);
            continue;
          }
          if (data.container == null && mutation.addedNodes.length === 1 && mutation.addedNodes[0].className === 'ltr-1420x7p') {
            console.log('mutation data', mutation);
            const container = mutation.addedNodes[0];
            /**
             * @type {HTMLElement}
             */
            const title = container.getElementsByClassName('ltr-qnht66')[0].getElementsByTagName('h4')[0];
            if (!title) continue;
            data.title = title.textContent.trim();
            const spanText = title.nextSibling.textContent.trim();
            const matches = /S(\d+)\s:\sE\s(\d+)/.exec(spanText);
            // console.log('matches spanText', matches);
            data.season = parseInt(matches[1], 10);
            data.episode = parseInt(matches[2], 10);
            data.container = 'controls';
            const btns = document.getElementsByClassName('play-button');
            for (let b = 0; b < btns.length; b++) {
              btns[b].addEventListener('click', loadVideo, false);
            }
            const next = document.getElementsByClassName('ltr-1enhvti');
            if (next.length > 0) {
              next[0].addEventListener('click', loadVideo);
            }
          } else if (mutation.removedNodes.length === 1 && mutation.removedNodes[0].className === 'ltr-1420x7p') {
            const btns = document.getElementsByClassName('play-button');
            for (let b = 0; b < btns.length; b++) {
              btns[b].removeEventListener('click', loadVideo);
            }
            const next = document.getElementsByClassName('ltr-1enhvti');
            if (next.length > 0) {
              next[0].removeEventListener('click', loadVideo);
            }
          }
        }
      }
    });
    observer.observe(watchPlayer, {childList: true, subtree: true, attributes: false});
    loadVideo();
  }

  history.onpushstate = (e) => {
    console.log('history onpushstate: ', e);
  };
  window.onpopstate = function(event) {
    console.log("adresse: " + document.location + ", état: " + JSON.stringify(event.state));
  };

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

})(window.history);
