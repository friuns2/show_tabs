var skipSave;
var storage;
var scope;
var timeout;
var treeOptions;

angular.module('my', ['ui.tree']).controller('TodoCtrl',
    function ($scope, $timeout, $filter) {

        scope = $scope;
        timeout = $timeout;
        storage = chrome.storage.local;
        getTabs();
        scope.treeOptions = treeOptions;
        scope.selectFolder = function(node)
        {
            console.log(node)
            scope.selectedFolder = node;

        }
        scope.toggle2 = function (scope, item) {
            item.collapsed = !item.collapsed;
            //scope.toggle();
            Save();
        };

        scope.remove = function (scope) {
            scope.remove();
        };


        scope.newSubItem = function (scope) {
            console.log(scope);
            var nodeData = scope.$modelValue;
            nodeData.nodes.push({nodes: [], windows: []});
        };




        scope.GetIcon = function (tab) {
            return tab.favIconUrl && tab.favIconUrl.startsWith("http") ? tab.favIconUrl : 'https://www.google.com/images/icons/product/ebooks-16.png';
        };

        scope.CloseTab = function (tab) {
            if (tab.id)
                chrome.tabs.remove(tab.id);
            else
                scope.selectedFolder.windows.forEach(function (win) {
                    Remove(win.tabs, tab);
                    Save();
                })
        };

        scope.SelectTab = function (tab) {

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

        scope.CloseWindow = function (window) {
            if (window.id)
                chrome.windows.remove(window.id);
            else
                RemoveWindow(window);
        }

        scope.RestoreWindow = function (window) {

            var map = window.tabs.map(function (v) {
                return v.url;
            })
            chrome.windows.create({"url": map});
            RemoveWindow(window);
        }

        scope.SaveWindow = function (window, into, pos) {
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

       

        scope.Save = function () {
            Save();
        }

    }).directive('script', function() {
    return {
        restrict: 'E',
        scope: false,
        link: function(scope, elem, attr)
        {
            if (attr.type==='text/javascript-lazy')
            {
                var s = document.createElement("script");
                s.type = "text/javascript";
                var src = elem.attr('src');
                if(src!==undefined)
                {
                    s.src = src;
                }
                else
                {
                    var code = elem.text();
                    s.text = code;
                }
                document.head.appendChild(s);
                elem.remove();
            }
        }
    };
});
