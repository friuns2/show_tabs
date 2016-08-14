
angular.module('my', ['ui.tree','xeditable']).controller('TodoCtrl',
    function ($scope, $timeout, $filter) {
        storage = chrome.storage.local;
        getTabs();
        chrome.tabs.onRemoved.addListener(function (tabid) {
            var tab = Enumerable.From($scope.windows).SelectMany(function (a) { return a.tabs;}).First(function (a) {return a.id == tabid;});

            if(!tab.url.startsWith("chrome-extension") && !skipSave && !$scope.savedWindows[0].tabs.contains(tab,function (a, b) { return a.url == b.url;})) {
                $scope.savedWindows[0].tabs.push(clone(tab));
                storage.set({windows: $scope.savedWindows});
                skipSave =false;
            }
            //$scope.closedWindows.push();
            getTabs();
        })
        chrome.tabs.onUpdated.addListener(function (tab) {
            getTabs();
        })
        $scope.toggle2 = function (scope,window) {
            window.collapsed = !window.collapsed;
            //scope.toggle();
            Save();
        };
        $scope.treeOptions = {

            beforeDrop : function (e) {

                var a = e.source.nodeScope.$modelValue;
                var b = e.dest.nodesScope.$parent.$modelValue;
                if(a && b) {
                    if (a.windowId && b.tabs) {
                        b.tabs.push(clone(a));
                        console.log("push");
                    }
                    Save();
                    getTabs();
                }
                return false;
            }
        }

        $scope.GetIcon = function (tab) {
            return  tab.favIconUrl && tab.favIconUrl.startsWith("http")?  tab.favIconUrl :'https://www.google.com/images/icons/product/ebooks-16.png';
        };

        $scope.CloseTab = function (tab) {

            if (tab.id)
                chrome.tabs.remove(tab.id);
            else
                $scope.savedWindows.forEach(function (win) {
                    Remove(win.tabs, tab);
                    Save();
                })
        };

        $scope.SelectTab = function (tab) {

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

        $scope.CloseWindow = function (window) {
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
            return {favIconUrl: tab.favIconUrl, title: tab.title, url: tab.url, rand: Math.floor((Math.random() * 100) + 1)};
        }
        var promise;
        function getTabs() {

            $timeout.cancel(promise);
            promise = $timeout(function () {
                chrome.windows.getAll({populate: true}, function (windows) {
                    $scope.windows = windows;

                    storage.get('windows', function (storage) {
                        $scope.savedWindows = storage.windows||[];
                        if(!$scope.savedWindows[0])
                            $scope.savedWindows[0] = {tabs:[]};
                        $scope.savedWindows[0].name ="closed";
                        Refresh();
                    });
                });
            }, 100);
        }

        function Refresh() {
            $scope.$apply();
        }

        function RemoveWindow(win) {
            if($scope.savedWindows.indexOf(win) == 0)
                win.tabs = [];
            else
                Remove($scope.savedWindows, win);
            Save();
            getTabs();
        }

        function Save() {
            storage.set({windows: $scope.savedWindows});
        }

        function AddWindow(win, remove) {
            $scope.savedWindows.push(win);
            Save();
            getTabs();
        }



    });
