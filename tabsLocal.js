/**
 * Created by Tuomas pc on 19.8.2016.
 */
function clone(tab) {
    return {
        favIconUrl: tab.favIconUrl,
        title: tab.title,
        url: tab.url,
        rand: Math.floor((Math.random() * 1000) + 1)
    };
}

var promise;

function getTabs() {

    timeout.cancel(promise);
    promise = timeout(function () {
        chrome.windows.getAll({populate: true}, function (windows) {
            scope.windows = windows;
            if(!scope.folders)
                storage.get('folders', function (storage) {
                    scope.folders = storage.folders || {nodes: [], windows: [], title: "default"};
                    scope.folders2 = [scope.folders];
                    if(!scope.selectedFolder)
                        scope.selectedFolder = scope.folders;

                    if (!scope.folders.windows[0]) {
                        scope.folders.windows[0] = {tabs: []};
                        scope.folders.windows[0].recentlyClosed = true;
                        scope.folders.windows[0].name = "closed";
                    }
                    Refresh();
                });
            else
                Refresh();
        });
    }, 100);
}

function AddWindow(win, remove) {
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
    if (scope.selectedFolder.windows.indexOf(win) == 0)
        win.tabs = [];
    else
        Remove(scope.selectedFolder.windows, win);
    Save();
    getTabs();
}