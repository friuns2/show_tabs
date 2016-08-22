/**
 * Created by Tuomas pc on 19.8.2016.
 */
function clone(tab) {
    return TabConstructor(tab);
}

function random() {
    return Math.floor((Math.random() * 1000) + 1);
}
var promise;

function TabConstructor(tab) {
    tab = tab || {};
    return {
        favIconUrl: tab.favIconUrl,
        title: tab.title,
        url: tab.url,
        id: random(),
        saved: true
    };
}
function WindowConstructor() {
    this.tabs = [];
    this.date = new Date().toISOString().slice(0, 20);
    this.id = random();
    this.saved = true;
}
function getTabsQuik() {
    chrome.windows.getAll({populate: true}, function (windows) {
        scope.windows = windows;

        windows.forEach(function (window) {
            window.tabs.forEach(function (tab) {
                if(tab.url == "chrome://newtab/" && !(tab.active && window.focused))
                    chrome.tabs.remove(tab.id);
            })
        })
        if (!scope.folders)
            storage.get('folders', function (storage) {
                scope.folders = storage.folders || {nodes: [], windows: [], title: "default"};
                scope.folders2 = [scope.folders];
                if (!scope.selectedFolder)
                    scope.selectedFolder = scope.folders;

                if (!scope.folders.windows[0]) {
                    scope.folders.windows[0] = new WindowConstructor();
                    scope.folders.windows[0].recentlyClosed = true;
                    scope.folders.windows[0].name = "closed";
                }
                Refresh();
            });
        else
            Refresh();
    });
}
function getTabs() {

    timeout.cancel(promise);
    promise = timeout(getTabsQuik, 100);
}

function AddWindow(win) {
    scope.selectedFolder.windows.splice(0, 0, win);
    Save();
    getTabs();
}
function Save() {
    storage.set({folders: scope.folders});
}

function Refresh() {
    scope.$apply();
}

function RemoveWindow(win) {

    Remove(scope.selectedFolder.windows, win);
    Save();
    getTabs();
}