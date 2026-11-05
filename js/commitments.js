/* Limited-spots visibility. Guarantee lines are not gated.
   showLimitedSpots in the config is the production switch.
   Off the production host the lines stay visible so a preview can be reviewed.
   ?preview=1 forces them on. ?preview=0 forces them off. */
(function (root) {
  function limitedSpotsVisible(options) {
    var opts = options || {};
    if (opts.preview === "1") return true;
    if (opts.preview === "0") return false;
    if (opts.showLimitedSpots === true) return true;
    var host = opts.hostname || "";
    return host !== "veloxlab.studio" && host !== "www.veloxlab.studio";
  }

  var api = { limitedSpotsVisible: limitedSpotsVisible };
  root.VELOX_COMMITMENTS = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
