chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.create({
        'url': chrome.extension.getURL('tabs.html')
    }, function (tab) {

    });
});

chrome.tabs.onUpdated.addListener(function (tab) {
    getTabs();
})