// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Show a list of all tabs in the same process as this one.
function init() {
    chrome.tabs.query({ currentWindow: true }, function (tabs) {
        var outputDiv = document.getElementById("tab-list");
        var titleDiv = document.getElementById("title");
        titleDiv.innerHTML = "<b>Tabs in Process " + ":</b>";

        tabs.forEach(function (tab) {
            displayTabInfo(tab.windowId, tab, outputDiv);
        });
    });
}



// Print a link to a given tab
function displayTabInfo(windowId, tab, outputDiv) {
  if (tab.favIconUrl != undefined) {
    outputDiv.innerHTML += "<img src='chrome://favicon/" + tab.url + "'>\n";
  }
  outputDiv.innerHTML +=
    "<b><a href='#' onclick='showTab(window, " + windowId + ", " + tab.id +
    ")'>" + tab.title + "</a></b><br>\n" +
    "<i>" + tab.url + "</i><br>\n";
}

// Bring the selected tab to the front
function showTab(origWindow, windowId, tabId) {
  // TODO: Bring the window to the front.  (See http://crbug.com/31434)
  //chrome.windows.update(windowId, {focused: true});
  chrome.tabs.update(tabId, { selected: true });
  origWindow.close();
}

// Kick things off.
document.addEventListener('DOMContentLoaded', init);
