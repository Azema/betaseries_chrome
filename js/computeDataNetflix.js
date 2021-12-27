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