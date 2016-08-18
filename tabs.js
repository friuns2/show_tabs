angular.module('my', ['ui.tree']).controller('TodoCtrl',
    function ($scope, $timeout, $filter) {

        var storage = chrome.storage.local;
        getTabs();
        chrome.tabs.onRemoved.addListener(function (tabid) {
            var tab = Enumerable.From($scope.windows).SelectMany(function (a) {
                return a.tabs;
            }).First(function (a) {
                return a.id == tabid;
            });

            if (!tab.url.startsWith("chrome-extension") && !skipSave && !$scope.folders.windows[0].tabs.contains(tab, function (a, b) {
                    return a.url == b.url;
                })) {
                $scope.folders.windows[$scope.folders.windows.length - 1].tabs.push(clone(tab));
                storage.set({windows: $scope.folders.windows});
                skipSave = false;
            }
            //$scope.closedWindows.push();
            getTabs();
        })
        chrome.tabs.onUpdated.addListener(function (tab) {
            getTabs();
        })
        $scope.selectFolder = function(node)
        {
            console.log(node)
            $scope.selectedFolder = node;

        }
        $scope.toggle2 = function (scope, item) {
            item.collapsed = !item.collapsed;
            //scope.toggle();
            Save();
        };

        $scope.remove = function (scope) {
            scope.remove();
        };


        $scope.newSubItem = function (scope) {
            console.log(scope);
            var nodeData = scope.$modelValue;
            nodeData.nodes.push({nodes: [], windows: []});
        };


        $scope.treeOptions = {
            dropped: function (e) {
                Save();
                getTabs();
            },
            beforeDrop: function (e) {

                var item = e.source.nodeScope.$modelValue;
                var alist = e.source.nodesScope.$modelValue;
                var blist = e.dest.nodesScope.$modelValue;
                if (item.recentlyClosed)return;
                $scope.selectedFolder.windows.folders.windows = true;
                $scope.selectedFolder.windows.forEach(function (a) {
                    a.tabs.savedTabs = true;
                })
                $scope.windows.activeWindows = true;
                $scope.windows.forEach(function (a) {
                    a.tabs.activeTabs = true;
                })

                if (alist.activeWindows) { //draging active window
                    if (blist.savedTabs) {
                        console.log("window to tabs")
                        $scope.SaveWindow(item, blist, e.dest.index);
                    }
                }

                if (alist.activeTabs) {
                    if (blist.savedTabs) {
                        blist.splice(e.dest.index, 0, clone(item));
                        chrome.tabs.remove(item.id);

                    }
                }
                Save();
                return alist == blist;
            }
        }

        $scope.GetIcon = function (tab) {
            return tab.favIconUrl && tab.favIconUrl.startsWith("http") ? tab.favIconUrl : 'https://www.google.com/images/icons/product/ebooks-16.png';
        };

        $scope.CloseTab = function (tab) {
            if (tab.id)
                chrome.tabs.remove(tab.id);
            else
                $scope.selectedFolder.windows.forEach(function (win) {
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
                chrome.windows.update(tab.windowId, {focused: true})
            }
        }

        $scope.CloseWindow = function (window) {
            if (window.id)
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
        $scope.SaveWindow = function (window, into, pos) {
            if (!into)
                var win = {tabs: [], date: new Date().toISOString().slice(0, 20)};

            window.tabs.forEach(function (tab) {
                if (!tab.url.startsWith("chrome-extension")) {
                    skipSave = true;
                    chrome.tabs.remove(tab.id);
                    if (into)
                        into.splice(pos++, 0, clone(tab))
                    else
                        win.tabs.push(clone(tab));

                }
            });
            if (!into)
                AddWindow(win);
        }

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

            $timeout.cancel(promise);
            promise = $timeout(function () {
                chrome.windows.getAll({populate: true}, function (windows) {
                    $scope.windows = windows;

                    storage.get('folders', function (storage) {
                        $scope.folders = storage.folders || {nodes: [], windows: [], title: "default"};
                        $scope.folders2 = [$scope.folders];
                        if(!$scope.selectedFolder)
                            $scope.selectedFolder = $scope.folders;
                        console.log($scope.folders)
                        if (!$scope.folders.windows[0]) {
                            $scope.folders.windows[0] = {tabs: []};
                            $scope.folders.windows[0].recentlyClosed = true;
                            $scope.folders.windows[0].name = "closed";
                        }
                        Refresh();
                    });
                });
            }, 100);
        }

        function Save() {
            storage.set({folders: $scope.folders});
        }

        function Refresh() {
            $scope.$apply();
        }

        function RemoveWindow(win) {
            if ($scope.selectedFolder.windows.indexOf(win) == 0)
                win.tabs = [];
            else
                Remove($scope.selectedFolder.windows, win);
            Save();
            getTabs();
        }

        $scope.Save = function () {
            Save();
        }


        function AddWindow(win, remove) {
            $scope.selectedFolder.windows.splice(0, 0, win);
            Save();
            getTabs();
        }


    }).filter('reverse', function () {
    return function (items) {
        return items.slice().reverse();
    };
});
