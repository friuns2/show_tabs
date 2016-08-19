/**
 * Created by Tuomas pc on 19.8.2016.
 */
treeOptionsFolders =
{
    accept: function (sourceNodeScope, destNodesScope, destIndex) {
        console.log(destNodesScope);
        return false;
    }
}
treeOptions = {
    accept: function (sourceNodeScope, destNodesScope, destIndex) {

            return true;
    },
    dropped: function (e) {
        Save();
        getTabs();
    },
    beforeDrop: function (e) {

        var item = e.source.nodeScope.$modelValue;
        var alist = e.source.nodesScope.$modelValue;
        var blist = e.dest.nodesScope.$modelValue;
        if (item.recentlyClosed)return;

        scope.selectedFolder.windows.forEach(function (a) {
            a.tabs.savedTabs = true;
        })
        scope.windows.activeWindows = true;
        scope.selectedFolder.windows.saveWindows = true;
        scope.windows.forEach(function (a) {
            a.tabs.activeTabs = true;
        })

        if (alist.activeWindows) { //draging active window
            if (blist.savedTabs) {
                console.log("window to tabs")
                scope.SaveWindow(item, blist, e.dest.index);
            }
        }

        if (alist.activeTabs) {
            if (blist.savedTabs) {
                blist.splice(e.dest.index, 0, clone(item));
                chrome.tabs.remove(item.id);

            }
        }
        Save();
        return alist == blist|| alist.savedTabs && blist.savedTabs || alist.savedWindows && blist.savedWindows;
    }
}