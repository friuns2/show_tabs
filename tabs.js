
angular.module('my', ['ui.tree']).controller('TodoCtrl',
    function ($scope, $timeout, $filter) {
        getTabs();
        chrome.tabs.onRemoved.addListener(function (tabid) {
            var tab = Enumerable.From($scope.windows).SelectMany(function (a) { return a.tabs;}).First(function (a) {return a.id == tabid;});
            if(!tab.url.startsWith("chrome-extension") && !skipSave) {
                $scope.savedWindows[0].tabs.push(clone(tab));
                chrome.storage.sync.set({windows: $scope.savedWindows});
            }
            skipSave =false;
            //$scope.closedWindows.push();
            getTabs();
        })
        chrome.tabs.onUpdated.addListener(function (tab) {
            getTabs();
        })
        $scope.removeTab = function (tab) {

            if (tab.id)
                chrome.tabs.remove(tab.id);
            else
                $scope.savedWindows.forEach(function (win) {
                    Remove(win.tabs, tab);
                })
        };

        $scope.selectTab = function (tab) {

            if (!tab.id) {
                chrome.tabs.create({url: tab.url})
                chrome.tabs.getCurrent(function (tab) {
                    chrome.tabs.update(tab.id, {selected: true});
                })
            }
            else {
                chrome.tabs.update(tab.id, {selected: true});
                chrome.windows.update(tab.windowId,{focused:true})
            }
        }

        $scope.RemoveWindow = function (window) {
            if(window.id)
                chrome.windows.remove(window.id);
            else
                RemoveWindow(window);
        }

        $scope.RestoreWindow = function (window) {

            var map = window.tabs.map(function (v) {
                return v.url;
            })
            chrome.windows.create({"url": map});
            RemoveWindow(window);
        }
        var skipSave;
        $scope.SaveWindow = function (window) {
            var windows = [];
            win = {tabs: [], date: new Date().toISOString().slice(0, 20)};

            window.tabs.forEach(function (tab) {
                if (!tab.url.startsWith("chrome-extension")) {
                    skipSave=true;
                    chrome.tabs.remove(tab.id);
                    win.tabs.push(clone(tab));
                }
            });

            AddWindow(win);

        }

        function clone(tab) {
            return {favIconUrl: tab.favIconUrl, title: tab.title, url: tab.url};
        }
        var promise;
        function getTabs() {

            $timeout.cancel(promise);
            promise = $timeout(function () {
                console.log($scope.savedWindows)
                chrome.windows.getAll({populate: true}, function (windows) {
                    $scope.windows = windows;

                    chrome.storage.sync.get('windows', function (storage) {
                        $scope.savedWindows = storage.windows;
                        if(!$scope.savedWindows[0])
                            $scope.savedWindows[0] = {tabs:[]};
                        $scope.savedWindows[0].name ="trash";
                        Refresh();
                    });
                });
            }, 100);
        }

        function Refresh() {
            $scope.$apply();
        }

        function RemoveWindow(win) {
            AddWindow(win, true);
        }

        function AddWindow(win, remove) {
            if (remove) {
                Remove($scope.savedWindows, win);
                console.log("remove")
            }
            else
                $scope.savedWindows.push(win);
            chrome.storage.sync.set({windows: $scope.savedWindows}, function () {
                console.log(savedWindows);
                getTabs()
            });
        }



    });
