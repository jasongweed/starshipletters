# Starship Letters

A Space Invaders-style game that teaches letter recognition. A target letter is
shown outside the game canvas; shoot the enemy ship carrying that letter.
Shooting the wrong letter doesn't cost a life, it just slows things down for a
few seconds. Speed ramps up as your score grows.

## Running it (from WSL2, viewed in a Windows browser)

From this directory, inside WSL2:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your Windows browser. WSL2 forwards
localhost to Windows by default, so no extra networking setup is needed.

Controls: arrow keys to move, spacebar to fire. On-screen touch buttons work
too (click them with a mouse, or tap on a touchscreen).

## Tests

Pure game logic (target letter sequencing, difficulty curve) is unit tested
with Node's built-in test runner:

```
node --test tests/
```
