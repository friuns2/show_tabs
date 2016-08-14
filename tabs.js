
angular.module('my', ['ui.tree']).controller('TodoCtrl',
    function ($scope, $timeout, $filter) {
        storage = chrome.storage.local;
        $scope.tree2 = [{
            'id': 1,
            'title': 'tree1 - item1',
            'nodes': [{
                'id': 1,
                'title': 'tree1 - item1',
                'nodes': []
            }]
        }, {
            'id': 2,
            'title': 'tree1 - item2',
            'nodes': []
        }, {
            'id': 3,
            'title': 'tree1 - item3',
            'nodes': []
        }, {
            'id': 4,
            'title': 'tree1 - item4',
            'nodes': []
        }];
        $scope.tree3 = [{
            'id': 1,
            'title': 'tree2 - item1',
            'nodes': []
        }, {
            'id': 2,
            'title': 'tree2 - item2',
            'nodes': []
        }, {
            'id': 3,
            'title': 'tree2 - item3',
            'nodes': []
        }, {
            'id': 4,
            'title': 'tree2 - item4',
            'nodes': []
        }];

        $scope.remove = function (scope) {
            scope.remove();
        };

        $scope.toggle = function (scope) {
            scope.toggle();
        };

        $scope.newSubItem = function (scope) {
            var nodeData = scope.$modelValue;
            nodeData.nodes.push({
                id: nodeData.id * 10 + nodeData.nodes.length,
                title: nodeData.title + '.' + (nodeData.nodes.length + 1),
                nodes: []
            });
        }
        $scope.GetIcon = function (tab) {
            return  tab.favIconUrl && tab.favIconUrl.startsWith("http")?  tab.favIconUrl :'https://www.google.com/images/icons/product/ebooks-16.png';
        };
        getTabs();
        chrome.tabs.onRemoved.addListener(function (tabid) {
            var tab = Enumerable.From($scope.windows).SelectMany(function (a) { return a.tabs;}).First(function (a) {return a.id == tabid;});

            if(!tab.url.startsWith("chrome-extension") && !skipSave && !$scope.savedWindows[0].tabs.contains(tab,function (a, b) { return a.url == b.url;})) {
                $scope.savedWindows[0].tabs.push(clone(tab));
                storage.set({windows: $scope.savedWindows});
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
                    Save();
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

                    storage.get('windows', function (storage) {
                        $scope.savedWindows = storage.windows||[];
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

        function Save() {
            storage.set({windows: $scope.savedWindows});
        }

        function AddWindow(win, remove) {
            if (remove) {
                Remove($scope.savedWindows, win);

                console.log("remove")
            }
            else
                $scope.savedWindows.push(win);
            Save();
            getTabs();
        }



    });
