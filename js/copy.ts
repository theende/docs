// Wraps every code block in a `.code-block` element with a "Copy" button.
// Shell prompts (`$ `, `> `) at the start of the copied text are left out.
for (const pre of document.querySelectorAll<HTMLPreElement>("pre")) {
  const button = document.createElement("button");
  const svg = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.25 8.75V19.25C16.25 19.8023 15.8023 20.25 15.25 20.25H4.75C4.19772 20.25 3.75 19.8023 3.75 19.25V8.75C3.75 8.19772 4.19772 7.75 4.75 7.75H15.25C15.8023 7.75 16.25 8.19772 16.25 8.75Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor"/>
      <path d="M7.75 7.75V4.75C7.75 4.19772 8.19772 3.75 8.75 3.75H19.25C19.8023 3.75 20.25 4.19772 20.25 4.75V15.26C20.25 15.8123 19.8023 16.26 19.25 16.26H16.25" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor"/>
    </svg>
  `;
  button.type = "button";
  button.innerHTML = svg;
  button.addEventListener("click", async () => {
    const text = (pre.querySelector("code") ?? pre).textContent ?? "";
    await navigator.clipboard?.writeText(text.replace(/^[$>\s]+/, ""));
    button.textContent = "Copied";
    setTimeout(() => button.innerHTML = svg, 2000);
  });

  const wrapper = document.createElement("div");
  wrapper.classList.add("code-block");
  pre.replaceWith(wrapper);
  wrapper.append(button, pre);
}
