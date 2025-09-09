// Dependencies are loaded via manifest.json script order

function cancelDownload(downloadItemId) {
  chrome.downloads.cancel(downloadItemId);
  chrome.downloads.erase({ id: downloadItemId });
}

function injectContentScript(tabId, callback) {
  chrome.tabs.executeScript(
    tabId,
    {
      file: "scripts/content.js",
    },
    function () {
      callback(!chrome.runtime.lastError);
    }
  );
}

function sendDownloadBlockedMessageToTab(tab, callback) {
  return chrome.tabs.sendMessage(
    tab.id,
    { action: TabMessageAction.DownloadBlocked },
    callback
  );
}

function sendDownloadBlockedMessageToTabWithRetry(tab) {
  sendDownloadBlockedMessageToTab(tab, () => {
    if (!chrome.runtime.lastError) {
      return;
    }

    injectContentScript(tab.id, (success) => {
      if (!success) {
        return;
      }

      setTimeout(() => {
        sendDownloadBlockedMessageToTab(tab);
      }, 100);
    });
  });
}

async function onDownloadCreate(downloadItem) {
  if (!downloadItem.url) {
    return;
  }
  let verdict = Verdict.Allow;
  try {
    const classification = await urlClassifier.classify(downloadItem.url);
    verdict = policyEnforcer.getVerdict({
      action: Action.Download,
      classification,
    });
  } catch (error) {
    console.error(error);
  }

  if (verdict === Verdict.Block) {
    cancelDownload(downloadItem.id);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) =>
      tabs.forEach(sendDownloadBlockedMessageToTabWithRetry)
    );
  }

  return { verdict };
}

async function onDownloadDeterminingFilename(downloadItem, suggest) {
  const { verdict } = await onDownloadCreate(downloadItem);
  if (verdict === Verdict.Allow) {
    suggest({});
  }
}

chrome.downloads.onDeterminingFilename.addListener(
  onDownloadDeterminingFilename
);
