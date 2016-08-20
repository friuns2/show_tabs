/**
 * Created by Tuomas pc on 19.8.2016.
 */
chrome.tabs.onRemoved.addListener(function (tabid) {
    var tab = Enumerable.From(scope.windows).SelectMany(function (a) {
        return a.tabs;
    }).First(function (a) {
        return a.id == tabid;
    });

    if (!tab.url.startsWith("chrome-extension") && !skipSave && !scope.folders.windows[0].tabs.contains(tab, function (a, b) {
            return a.url == b.url;
        })) {
        scope.folders.windows[scope.folders.windows.length - 1].tabs.push(clone(tab));
        storage.set({windows: scope.folders.windows});
        skipSave = false;
    }
    //scope.closedWindows.push();
    getTabs();
})
chrome.tabs.onUpdated.addListener(function (tab) {
    getTabs();
})

window.onerror = function (msg, url, lineNo, columnNo, error) {
    scope.lastError = msg;
    return false;
}