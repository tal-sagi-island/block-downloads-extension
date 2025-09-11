// Dependencies are loaded via manifest.json script order

function cancelDownload(downloadItemId) {
  chrome.downloads.cancel(downloadItemId);
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

function sendDownloadBlockedMessageToTabCallback(tab) {
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
}

function sendDownloadBlockedMessageToTabWithRetry(tab) {
  sendDownloadBlockedMessageToTab(tab, () => sendDownloadBlockedMessageToTabCallback(tab));
}

function isUrlShouldScanDownloads(url) {
  if (!url) {
    return false;
  }
  return url.startsWith('http') || url.startsWith('https');
}

async function onDownloadCreate(downloadItem) {
  if (!isUrlShouldScanDownloads(downloadItem.url)) {
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
