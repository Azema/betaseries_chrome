
let lang = "fr";
const language_enabled = ["fr", "en"];
const lang_nav = navigator.language.slice(0, 2);
if (language_enabled.includes(navigator.language)) lang = navigator.language;

var tag = document.createElement("script");
tag.src = "/_locales/translation_" + lang + ".js";
document.getElementsByTagName("head")[0].appendChild(tag);
