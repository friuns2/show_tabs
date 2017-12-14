chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.create({
        'url': chrome.extension.getURL('tabs.html')
    }, function (tab) {

    });
});

chrome.windows.onFocusChanged.addListener(function(windowId) {
    chrome.tabs.getCurrent(function (e) {
        this.lastTab = e;
    })
});
chrome.tabs.onActivated.addListener(function (e) {
    chrome.tabs.get(e.tabId,function (e) {
        //if(e.url != "chrome://newtab/")
            this.lastTab = e;
    //})
})