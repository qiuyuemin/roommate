/* Runtime refinements: temporary spring position is rendered independently from the saved levels. */
(function () {
  var r36Controls = v4Controls;
  v4Controls = function () {
    var markup = r36Controls();
    var drag = Math.max(-3, Math.min(3, Number(state.doseDrag) || 0));
    return markup.replace('data-v4-drag="both"', `data-v4-drag="both" data-drag="${drag}"`);
  };
  v4View();
})();
