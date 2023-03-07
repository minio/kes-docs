import ClipboardJS from "clipboard/src/clipboard";

export const clipboard = () => {
	const COPY_ELS = document.querySelectorAll(".highlight.copy");

	if (COPY_ELS.length) {
		COPY_ELS.forEach((el) => {
			// Create copy button
			const COPY_BTN = document.createElement("button");
			COPY_BTN.setAttribute("class", "copy-btn text-xs font-medium absolute top-1.5 right-3 opacity-0 cursor-pointer transition-opacity duration-200");
			COPY_BTN.setAttribute("type", "button");
			COPY_BTN.setAttribute("aria-label", "Copy to clipboard");
			COPY_BTN.innerHTML = "Copy";
			COPY_BTN.onclick = () => {};

			el.insertAdjacentElement("afterBegin", COPY_BTN);

			// Init clipboard js
			let clipboardBtn = new ClipboardJS(COPY_BTN, {
				text: function (trigger) {
					return trigger.nextElementSibling.innerText.replace(/^\s*[\r\n]/gm, "");
				},
			});

			// Show success text
			clipboardBtn.on("success", function (e) {
				e.clearSelection();
				e.trigger.textContent = "Copied";
				setTimeout(function () {
					e.trigger.textContent = "Copy";
				}, 2000);
			});
		});
	}
};
