const fetch = require("node-fetch");
const fs = require("fs");

const language_enabled = ["fr", "en"];

const refreshTranslation = (lang) => {
  console.log("Fetching translation " + lang);
  fetch(
    "https://localise.biz/api/export/locale/" +
      lang +
      ".js?key=c3gvhId51iCmrnTJW56QqlrWgQEdkVGr",
    {
      method: "GET",
    }
  )
    .then((res) => res.text())
    .then((resp) => {
      if (!fs.existsSync("./_locales")) {
        fs.mkdirSync("./_locales", { recursive: true });
      }
      fs.writeFileSync("./_locales/translation_" + lang + ".js", resp);
      console.log("Done " + lang);
    });
  fetch(
    "https://localise.biz/api/export/locale/" +
      lang +
      ".json?filter=popup&key=c3gvhId51iCmrnTJW56QqlrWgQEdkVGr",
    {
      method: "GET",
    }
  )
    .then((res) => res.text())
    .then((resp) => {
      const jsonMessages = JSON.parse(resp);
      const keyMessages = Object.keys(jsonMessages);
      const messages = keyMessages.reduce((acc, val) => {
        if (!acc[val]) {
          acc[val] = {
            message: jsonMessages[val],
            description: jsonMessages[val],
          };
          return acc;
        }
      }, {});
      if (!fs.existsSync("./_locales")) {
        fs.mkdirSync("./_locales", { recursive: true });
      }
      if (!fs.existsSync("./_locales/" + lang)) {
        fs.mkdirSync("./_locales/" + lang, { recursive: true });
      }
      fs.writeFileSync(
        "./_locales/" + lang + "/messages.json",
        JSON.stringify(messages)
      );
      console.log("Done Popup " + lang);
    });
};

language_enabled.forEach((item) => refreshTranslation(item));
