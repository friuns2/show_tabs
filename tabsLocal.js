/**
 * Created by Tuomas pc on 19.8.2016.
 */
function clone(tab) {
    return TabConstructor(tab);
}

function random()
{
    return Math.floor((Math.random() * 1000) + 1);
}
var promise;

function TabConstructor(tab) {
    tab = tab||{};
    return {favIconUrl: tab.favIconUrl,
        title: tab.title,
        url: tab.url,
        id: random()};
}
function WindowConstructor () {
    this.tabs = [];
    this.date = new Date().toISOString().slice(0, 20);
    this.id = random();
}

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

        Remove(scope.selectedFolder.windows, win);
    Save();
    getTabs();
}