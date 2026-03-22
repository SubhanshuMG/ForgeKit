# ForgeKit CLI Demo
# Run with: vhs demo.tape
# Outputs:  docs/public/demo.gif  +  docs/public/demo.mp4

Output docs/public/demo.gif
Output docs/public/demo.mp4

Require node

Set Shell "bash"
Set FontSize 14
Set FontFamily "JetBrains Mono"
Set Width 900
Set Height 500
Set Theme "Catppuccin Mocha"
Set Padding 20
Set TypingSpeed 40ms
Set PlaybackSpeed 0.8

# --- intro pause ---
Sleep 1s

Type "# ForgeKit — scaffold a production-ready project in seconds"
Sleep 1.5s
Enter

Sleep 500ms

# --- show available templates ---
Type "node packages/cli/dist/index.js list"
Sleep 300ms
Enter
Sleep 3s

# --- scaffold a web app ---
Type "node packages/cli/dist/index.js new my-app --template web-app --skip-install --dir /tmp"
Sleep 300ms
Enter
Sleep 4s

# --- show what was created ---
Type "ls /tmp/my-app"
Sleep 300ms
Enter
Sleep 2s

Type "cat /tmp/my-app/package.json"
Sleep 300ms
Enter
Sleep 2.5s

# --- scaffold a Python API ---
Sleep 500ms
Type "node packages/cli/dist/index.js new my-api --template api-service --skip-install --dir /tmp"
Sleep 300ms
Enter
Sleep 4s

Type "ls /tmp/my-api"
Sleep 300ms
Enter
Sleep 2s

# --- outro ---
Sleep 1s
Type "# Done. Any stack. One command."
Sleep 2s
Enter
Sleep 1.5s
