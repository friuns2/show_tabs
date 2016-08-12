angular.module('my', []).controller('TodoCtrl',
    function ($scope, $timeout, $filter) {
        chrome.tabs.onRemoved.addListener(function () {
            getTabs();
        })
        chrome.tabs.onUpdated.addListener(function () {
            getTabs();
        })

        getTabs();
        $scope.removeTab = function (tab) {

            if (tab.id)
                chrome.tabs.remove(tab.id);
            else
                $scope.windows.forEach(function (win) {
                    Remove(win.tabs, tab);
                })
        };

        $scope.selectTab = function (tab) {

            if (!tab.id)
                chrome.tabs.create({url: tab.url})
            else {
                chrome.tabs.update(tab.id, {selected: true});
                chrome.windows.update(tab.windowId,{focused:true})
            }
        }
        $scope.RemoveWindow = function (window) {
            RemoveWindow(window);
        }

        $scope.RestoreWindow = function (window) {

            var map = window.tabs.map(function (v) {
                return v.url;
            })
            chrome.windows.create({"url": map});
            RemoveWindow(window);
        }


        $scope.SaveWindow = function (window) {
            var windows = [];
            win = {tabs: [], date: new Date().toISOString().slice(0, 20)};

            window.tabs.forEach(function (tab) {
                if (!tab.url.startsWith("chrome-extension")) {
                    chrome.tabs.remove(tab.id);
                    win.tabs.push({favIconUrl: tab.favIconUrl, title: tab.title, url: tab.url});
                }
            });

            AddWindow(win);

        }
        var promise;
        var savedWindows;

        function getTabs() {
            $timeout.cancel(promise);
            promise = $timeout(function () {
                chrome.windows.getAll({populate: true}, function (windows) {
                    chrome.storage.sync.get('windows', function (storage) {
                        savedWindows = storage.windows;
                        $scope.windows = windows.concat(storage.windows);
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
                Remove(savedWindows, win);
                console.log("remove")
            }
            else
                savedWindows.push(win);
            chrome.storage.sync.set({windows: savedWindows}, function () {
                console.log(savedWindows);
                getTabs()
            });
        }

        function Remove(arr, item) {
            for (var i = arr.length; i--;) {
                if (arr[i] === item) {
                    arr.splice(i, 1);
                }
            }
        }

    });
