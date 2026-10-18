---
last_modified: 2026-06-17
title: "ende completions"
oldUrl: /runtime/manual/tools/completions/
command: completions
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende completions"
description: "Generate shell completions for Ende"
---

You can use the output script to configure autocompletion for `ende` commands.
For example: `ende un` -> <kbd>Tab</kbd> -> `ende uninstall`.

> [!NOTE]
> If you installed Ende with Homebrew, shell completions are installed and kept
> up to date for you, as long as your shell is configured to load completions
> from Homebrew's completions directory. In that case you do not need to run
> `ende completions` manually.

## Examples

### Configure Bash shell completion

```sh
ende completions bash > ende.bash

if [ -d "/usr/local/etc/bash_completion.d/" ]; then
  sudo mv ende.bash /usr/local/etc/bash_completion.d/
  source /usr/local/etc/bash_completion.d/ende.bash
elif [ -d "/usr/share/bash-completion/completions/" ]; then
  sudo mv ende.bash /usr/share/bash-completion/completions/
  source /usr/share/bash-completion/completions/ende.bash
else
  echo "Please move ende.bash to the appropriate bash completions directory"
fi
```

### Configure PowerShell shell completion

```sh
ende completions powershell | Out-String | Invoke-Expression
```

### Configure zsh shell completion

First add the following to your `.zshrc` file:

```sh
fpath=(~/.zsh/completion $fpath)
autoload -U compinit
compinit
```

Then run the following commands:

```sh
ende completions zsh > _ende
mv _ende ~/.zsh/completion/_ende
autoload -U compinit && compinit
```

### Configure fish shell completion

```sh
ende completions fish > completions.fish
chmod +x ./completions.fish
```
