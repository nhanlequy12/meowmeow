---
name: sprite-lean
description: Token-saving discipline for drawing or fixing pixel sprites and other code-drawn game art in an existing codebase. Use whenever a task asks to draw, convert, restyle or fix sprites, costumes, animation frames or review sheets, especially in unattended (exec) runs with a usage limit. It replaces reading the art engine with a context command and one small review image, and caps every command's output.
---

# Sprite Lean

Measured on 17 sprite sessions in this workspace: about 70% of the tokens went into reading engine source
(old renderer 41%, new kit 22%, spec 7%); images and the modules written were under 10%. Everything printed
is paid again on every later step, so the saving is in what you do not print.

## Order of work

1. **Context command first.** If the repo has one (here: `node tools/catctx.js <key…>`), run it and work from its
   output. It gives colours, flags, the exact legacy code for each part, and anchors. Do not open the engine files.
2. **Read the card, not the engine.** If the repo has a short API card (here: `docs/catkit-card.md`), read it once.
   Open engine source only for a question the card cannot answer: `rg -n '<symbol>' <file> | head -20`, then
   `sed -n 'a,bp' <file> | cut -c1-300`, at most about 60 lines.
3. **Write the whole module in one patch**, from the card's template. Do not print it back.
4. **Check silently.** `node --check <file> && <qa tool> --quiet; echo $?`. Look at details only on failure, through `| head -20`.
5. **One small image per look.** Open the smallest review image (here: `preview/<key>/peek.png`, new art above old
   art). Open the full sheet only for a frame you already suspect. Never open the same image twice without a change
   in between. Never open GIFs.
6. **Fix in small patches**, then repeat 4 and 5. Two review rounds per character is the normal budget; stop when QA
   passes and the character is recognisable at game size.

## Never

- `cat` a file over 200 lines, a data file, a PNG, base64, or a JSON report. Print the one number you need instead.
- Dump pixel grids or frames as text to "see" them. Use the review image, or print a bounding box or a count.
- Re-read a file you wrote, or re-read the task, the card or the context output.
- Search for instruction files beyond the repo root `AGENTS.md`.
- Run `git diff` in full. Use `git diff --stat`.
- Explore neighbouring modules "for style". One sample module is enough.

## Batch and finish

- Put short commands in one shell call. Preview all the task's keys in one QA call.
- For several similar characters, write the shared helper once inside your own file and reuse it.
- Final report: files changed, QA result per key, what a human should look at. No narrative, under 15 lines.

## If the repo has no context command

Make one before drawing: a script that prints, for one character, only its palette, flags, the legacy drawing code of
its parts with line numbers, and anchor coordinates. Under 3 KB of output per character. Then follow the order above.
