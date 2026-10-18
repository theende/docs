// Adds a "Copy" button to every code block. Shell prompts (`$ `, `> `) at the
// start of the copied text are left out.
for (const pre of document.querySelectorAll<HTMLPreElement>("pre")) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Copy";
  button.addEventListener("click", async () => {
    const text = (pre.querySelector("code") ?? pre).textContent ?? "";
    await navigator.clipboard?.writeText(text.replace(/^[$>\s]+/, ""));
    button.textContent = "Copied";
    setTimeout(() => button.textContent = "Copy", 2000);
  });
  pre.before(button);
}
