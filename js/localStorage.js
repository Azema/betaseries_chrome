const set = (key, value, cb = () => {}) => {
  chrome.storage.local.set({ [key]: value }, () => cb());
};

const get = (key) =>
  new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      if (result?.[key]) resolve(result?.[key]);
      resolve(null);
    });
  });

const remove = (key, cb = () => {}) => {
  chrome.storage.local.remove([key], (result) => {
    cb(result);
  });
};

const clear = (cb = () => {}) => {
  chrome.storage.local.clear(function () {
    cb();
  });
};

const localStorage = { set, get, remove, clear };
