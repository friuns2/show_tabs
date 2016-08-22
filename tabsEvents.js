/**
 * Created by Tuomas pc on 19.8.2016.
 */


window.onerror = function (msg, url, lineNo, columnNo, error) {
    scope.lastError = msg;
    return false;
}
chrome.tabs.onRemoved.addListener(function (tabid) {
    var tab = Enumerable.From(scope.windows).SelectMany(function (a) {
        return a.tabs;
    }).First(function (a) {
        return a.id == tabid;
    });

    recentlyClosed = scope.folders.windows[scope.folders.windows.length - 1];
    if (!tab.url != "chrome://newtab/" && !skipSave && !recentlyClosed.tabs.contains(tab, function (a, b) {return a.url == b.url;})) {

        recentlyClosed.tabs.push(clone(tab));
        if(recentlyClosed.tabs.length>10)
            recentlyClosed.tabs.splice(recentlyClosed.length-1,1);
        Save();
        skipSave = false;
    }
    //scope.closedWindows.push();
    getTabs();
})