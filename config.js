const config = {
  api: "https://api.betaseries.com",
  url_redirect: "https://www.betaseries.com",
  services: [
    {
      name: "Netflix",
      enabled: true,
      handler: "handleReadCookiesNetflix",
      target: "netflix",
      link: "https://www.netflix.com",
      buildId: "v09d292ec"
    },
    {
      name: "Arte",
      enabled: true,
      handler: "handleReadCookiesArte",
      target: "arte",
      link: "https://www.arte.tv",
    },
    {
      name: "Canal Plus Séries",
      enabled: false,
      handler: "handleReadCookiesCanalPlus",
      target: "canalPlus",
      link: "https://www.canalplus.com",
    },
  ],
  app: {
    api_key: "9676a6078b37",
    secret_key: "a7a57fdeba8e90715ffd32bbcad7dee0",
    api_version: "3.0",
    member_id: "464427"
  },
  listCookies: {
    netflix: [
      "NetflixId",
      "SecureNetflixId",
      "cL",
      "OptanonConsent",
      "nfvdid",
      "memclid",
      "clSharedContext",
    ],
    arte: ["lr-user--token"],
    canalPlus: ["passId", "sessionId"],
  },
  listListener: [
    {
      target: "handleReadCookiesNetflix",
      callback: () => handleReadCookies("netflix", "handleReadCookiesNetflix"),
    },
    {
      target: "handleReadCookiesArte",
      callback: () => handleReadCookies("arte", "handleReadCookiesArte"),
    },
    {
      target: "handleReadCookiesCanalPlus",
      callback: () =>
        handleReadCookies("canalPlus", "handleReadCookiesCanalPlus"),
    },
    {
      target: "connectAccountBS",
      callback: () => handleConnectAccountBS(),
    },
    {
      target: "disconnectAccountBS",
      callback: () => handleDisconnectAccountBS(),
    },
    {
      target: "openSettingsSynchro",
      callback: () => handleOpenSettingsSynchro(),
    },
    {
      target: "close-modal",
      callback: () => actionModal(false),
    },
  ],
};
