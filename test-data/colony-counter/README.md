# Colony counter test data

Development fixtures for the offline Colony Counter & CFU Calculator
(`/calculation-tools/cfu-calculator`, code in `src/components/calculators/colony/`).

**Nothing here is evidence of accuracy on real plates.** The numbers the tests print describe
these fixtures only. Do not quote them as the tool's accuracy unless a documented dataset of real
plates, counted by people with a stated method, backs them.

## Synthetic plates — `fixtures.json` → `synthetic`

Drawn by `sample.ts` from the listed parameters (seed, size, colony count, touching pairs, light
or dark agar), so every colony position is known. `node --test scripts/colony-counter.test.mts`
runs the real OpenCV.js detector on each one and checks precision and recall against the
`minPrecision` / `minRecall` floors.

## Real photographs — `fixtures.json` → `photos`

Put the image next to this file and add an entry. `expectedCount` is a manual count, and
`countedBy` / `method` say who counted it and how (e.g. two people, marker pen on the lid).

```json
{ "file": "plate-01.jpg", "expectedCount": 52, "countedBy": "", "method": "", "notes": "" }
```

Node has no JPEG decoder in this repo, so photos are checked in the browser instead: open
`/calculation-tools/cfu-calculator?validate=1`, load the photo, enter its expected count, and
analyse. The validation panel shows absolute and percentage error, and — after you remove false
markers and add missed colonies — precision, recall and F1 from your corrections.

Photographs of real plates can be large; keep them under 10 MB (the tool's own limit) and think
twice before committing many of them, because git keeps every version forever.
