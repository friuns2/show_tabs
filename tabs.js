﻿var skipSave;
var storage;
var scope;
var timeout;
var treeOptions;
var treeOptionsFolders;
var bg;
angular.module('my', ['ui.tree','ngMaterial']).controller('TodoCtrl',
    function ($scope, $timeout, $filter) {

        scope = $scope;
        timeout = $timeout;
        //storage = chrome.storage.local;
        storage = chrome.storage.sync;
        scope.errorCount=0;
        bg = chrome.extension.getBackgroundPage();
        chrome.tabs.getCurrent(function (e) {
            chrome.tabs.move(e.id,{index:bg.lastTab.index});
        })

        getTabsQuik();
        scope.treeOptions = treeOptions;
        scope.treeOptionsFolders = treeOptionsFolders;
        scope.mergeAll = function () {
            chrome.windows.getCurrent(function (current) {
                chrome.windows.getAll({populate: true},function (windows) {
                    windows.forEach(function (window) {
                        var tabs = window.tabs.select(function (a) {return a.id;});
                        if(window!=current)
                            chrome.tabs.move(tabs, {windowId: current.id,index:-1})

                    })
                })
            })
            getTabs()
        }
        scope.setFolderToDrop = function(f)
        {
            scope.folderToDrop=f;
        }
        scope.selectFolder = function(node)
        {
            scope.selectedFolder = node;
        }
        scope.toggle2 = function (scope, item) {
            item.collapsed = !item.collapsed;
            //scope.toggle();
            Save();
        };



        scope.newSubItem = function (scope) {
            console.log(scope);
            var nodeData = scope.$modelValue;
            nodeData.nodes.push({nodes: [], windows: []});
        };




        scope.GetIcon = function (tab) {
            return tab.favIconUrl && tab.favIconUrl.startsWith("http") ? tab.favIconUrl : 'https://www.google.com/images/icons/product/ebooks-16.png';
        };

        scope.CloseTab = function (s) {

            if (!s.$modelValue.saved)
                chrome.tabs.remove(s.$modelValue.id);
            else {
                s.remove();
                Save();
            }
        };

        scope.SelectTab = function (tab) {

            if (tab.saved) {
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

            if (window.recentlyClosed)
                window.tabs = [];
            else if (!window.saved)
                chrome.windows.remove(window.id);
            else
                RemoveWindow(window);
        }

        scope.RestoreWindow = function (window) {

            var map = window.tabs.map(function (v) {
                return v.url;
            })
            chrome.windows.create({"url": map,"focused": false});
            RemoveWindow(window);
        }

        scope.SaveWindow = function (window, into, pos) {
            if (!into)
                var win = new WindowConstructor();

            window.tabs.forEach(function (tab) {
                if (tab.url != "chrome://newtab/") {
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

    });
