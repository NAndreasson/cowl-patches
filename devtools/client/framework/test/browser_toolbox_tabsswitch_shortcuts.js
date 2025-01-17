/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80: */
/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

requestLongerTimeout(2);

var {Toolbox} = require("devtools/client/framework/toolbox");

add_task(function*() {
  let tab = yield addTab("about:blank");
  let target = TargetFactory.forTab(tab);
  yield target.makeRemote();

  let toolIDs = gDevTools.getToolDefinitionArray()
                         .filter(def => def.isTargetSupported(target))
                         .map(def => def.id);

  let toolbox = yield gDevTools.showToolbox(target, toolIDs[0],
                                            Toolbox.HostType.BOTTOM);
  let nextKey = toolbox.doc.getElementById("toolbox-next-tool-key")
                           .getAttribute("key");
  let prevKey = toolbox.doc.getElementById("toolbox-previous-tool-key")
                           .getAttribute("key");

  // Iterate over all tools, starting from options to netmonitor, in normal
  // order.
  for (let i = 1; i < toolIDs.length; i++) {
    yield testShortcuts(toolbox, i, nextKey, toolIDs);
  }

  // Iterate again, in the same order, starting from netmonitor (so next one is
  // 0: options).
  for (let i = 0; i < toolIDs.length; i++) {
    yield testShortcuts(toolbox, i, nextKey, toolIDs);
  }

  // Iterate over all tools in reverse order, starting from netmonitor to
  // options.
  for (let i = toolIDs.length - 2; i >= 0; i--) {
    yield testShortcuts(toolbox, i, prevKey, toolIDs);
  }

  // Iterate again, in reverse order again, starting from options (so next one
  // is length-1: netmonitor).
  for (let i = toolIDs.length - 1; i >= 0; i--) {
    yield testShortcuts(toolbox, i, prevKey, toolIDs);
  }

  yield toolbox.destroy();
  gBrowser.removeCurrentTab();
});

function* testShortcuts(toolbox, index, key, toolIDs) {
  info("Testing shortcut to switch to tool " + index + ":" + toolIDs[index] +
       " using key " + key);

  let onToolSelected = toolbox.once("select");
  EventUtils.synthesizeKey(key, {accelKey: true}, toolbox.win);
  let id = yield onToolSelected;

  info("toolbox-select event from " + id);

  is(toolIDs.indexOf(id), index,
     "Correct tool is selected on pressing the shortcut for " + id);
}
