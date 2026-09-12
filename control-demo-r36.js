/* Render the Boss spring displacement independently from mode or saved levels. */
(function(){var controls=v4Controls;v4Controls=function(){var markup=controls(),drag=Math.max(-3,Math.min(3,Number(state.doseDrag)||0));return markup.replace('data-v4-drag="both"',`data-v4-drag="both" data-drag="${drag}"`);};v4View();})();
