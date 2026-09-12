# Air 2 interactive H5 demo

Run locally:

```sh
python3 -m http.server 4173 --directory air2-h5-demo
```

The visual states are direct 402×874 Figma frame renders. The H5 adds state transitions, a live session timer, dynamic left/right milk amounts, sequential Fit Check feedback, Auto Switch and program transitions, the hold-to-finish interaction, and a logged notification animation.

## Review / annotation mode

Open `http://127.0.0.1:4173/?review=1`.

1. Select **Mark screen**.
2. Click/tap the point to change and write the feedback.
3. Use **Export JSON** and attach `air2-demo-feedback.json` in this chat, or use **Copy notes** and paste the output.

Every note includes the current H5 state, Figma file key, and its exact x/y coordinate in the 402×874 design canvas.
