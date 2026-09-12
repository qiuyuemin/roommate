# Air 2 interactive H5 demo

Run locally:

```sh
python3 -m http.server 4173 --directory air2-h5-demo
```

Open [http://127.0.0.1:4173/](http://127.0.0.1:4173/).

This version is built with HTML, CSS and JavaScript. It uses only the Figma-exported pump and icon assets in `assets/figma`; it does not display any full-page Figma screenshot.

The implemented main flow is:

1. Connected device → breast-pump home → Pump Control.
2. Start pumping → sequential Fit Check (position, alignment, suction, battery).
3. Manual Stimulation, left/right level controls, Both linkage, Speed and Auto Switch.
4. Automatic transfer to Expression after let-down detection.
5. Open the program list → expand and choose Milk Boost → confirm the switch.
6. Hold the finish button → log left/right milk and duration → save → logged result.

Other visible controls have a working behavior too: back/settings, mode tabs, switches, manual modes, all program rows, a create-program form, plus milk/duration controls, home/device navigation and session pause.

## Review / annotation mode

Open [http://127.0.0.1:4173/?review=1](http://127.0.0.1:4173/?review=1).

1. Select **Mark screen**.
2. Tap a point and describe the adjustment.
3. Use **Export JSON** and attach the downloaded `air2-demo-review-notes.json` here, or use **Copy notes** and paste its content.

Each note retains the active screen, whether an overlay was open, and the exact x/y coordinate in the 402 × 874 canvas. That lets me change the corresponding DOM component without guessing from a screenshot.
