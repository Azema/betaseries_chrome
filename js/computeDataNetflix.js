async function callLastActivityNetflix(guid) {
  let endCall = false;
  let currentPage = 0;
  let prevLastViewedItem = 0;
  do {
    const dataApi = await callNetflixAPIActivity(guid, currentPage);
    if (!dataApi) { return; }
    if (dataApi.viewedItems.length > 0) {
      if (currentPage === 0) {
        prevLastViewedItem = await localStorage.get('lastDateViewedItem') || 0;
        const lastDateViewedItem = dataApi.viewedItems[0].date;
        // Si il n'y a pas de changement, on s'arrête là
        if (lastDateViewedItem <= prevLastViewedItem) {
          console.log('Pas de nouveaux éléments vu');
          return;
        }
        localStorage.set('lastDateViewedItem', lastDateViewedItem);
      }
      // Si les éléments, sur les pages suivantes, ont déjà été traités, on s'arrête là
      else if (prevLastViewedItem > 0 && prevLastViewedItem > dataApi.viewedItems[0].date) {
        console.log('Pas de nouveaux éléments vu sur la page: %d', currentPage);
        return;
      }
    }
    callNetflixActivity(dataApi);
    endCall = dataApi.viewedItems.length < 20 || currentPage >= 1;
    currentPage++;
  } while (!endCall);
}
// TODO: Ajouter une fonction pour ajouter l'épisode vu sur le compte du membre
/*
{
    "type": "playend",
    "data": {
        "title": "Chesapeake Shores",
        "season": 1,
        "episode": 10,
        "container": "controls",
        "send": true
    }
}

Les étapes:
  1 - Rechercher la série à partir du titre
    1.1 - Si il n'y a qu'un seul résultat, alors on a la série
    1.2 - Si il y a plusieurs résultats, on récupère la liste des séries du membre
          et on recherche une correspondance avec les résultats
  2 - Ajouter l'épisode comme étant Vu sur l'API
*/
async function callWatchedEpisode(data) {
  callBsApi('GET', 'shows', 'search', {title: data.title, summary: true})
  .then(resp => {
    let promise;
    if (resp?.shows?.length <= 0) {
      // Allo Houston, on a un problème
      console.warn('Aucune série trouvée avec le titre: %s', data.title);
      return;
    } else if (resp?.shows?.length === 1) {
      // Super, on l'a trouvé du premier coup
      promise = Promise.resolve(resp.shows[0].id);
    } else if (resp?.shows?.length > 1) {
      const showIds = new Array(resp.shows.length);
      for (let s = 0; s < resp.shows.length; s++) {
        showIds.push(resp.shows[s].id);
      }
      // Il faut vérifier la correspondance avec les séries du membre
      const params = {
        id: config.app.member_id,
        summary: true,
        order: "last_seen",
        // limit: 10,
        status: 'current'
      };
      promise = callBsApi('GET', 'shows', 'member', params)
      .then(res => {
        if (res?.shows?.length > 0) {
          for (let s = 0; s < res.shows.length; s++) {
            if (showIds.includes(res.shows[s].id)) {
              // Il semblerait que nous ayons trouvé notre série
              return res.shows[s].id;
            }
          }
        }
        return null;
      });
    }
    promise.then(res => {
      if (!res) { return; }
      const params = {
        id: res,
        season: data.season,
        episode: data.episode
      };
      callBsApi('GET', 'shows', 'episodes', params)
      .then(resp => {
          if (resp?.episodes?.length <= 0) {
              console.warn("L'épisode n'a pas été trouvé, étrange!", data);
              return null;
          }
          if (!resp.episodes[0].user.seen) {
            return resp.episodes[0].id;
          } else {
            return null;
          }
      })
      .then(episodeId => {
        if (!episodeId) return;
        callBsApi('POST', 'episodes', 'watched', {id: episodeId, bulk: true});
      })
    })
  })
}