export const toc = () => {
	const TOC_ELEM = document.getElementById("toc");
	const TOC_TOGGLE_ELEM = document.getElementById("toc-toggle");
	const TOC_DROPDOWN_ELEM = document.getElementById("toc-dropdown");
	const TOC_TOGGLE_ICON = document.querySelector("#toc-toggle svg");
	let isTocActive = false;

	const TOC_BACKDROP = document.createElement("div");
	TOC_BACKDROP.setAttribute("class", "fixed top-0 left-0 w-full h-full z-[1] lg:hidden cursor-pointer");
	TOC_BACKDROP.onclick = () => {
		toggleTocDropdown();
	};

	const toggleTocDropdown = () => {
		isTocActive = !isTocActive;
		TOC_DROPDOWN_ELEM.classList.toggle("active", isTocActive);
		TOC_TOGGLE_ELEM.classList.toggle("active", isTocActive);
		TOC_TOGGLE_ICON.classList.toggle("rotate-180", isTocActive);

		if (isTocActive) {
			TOC_ELEM.insertAdjacentElement("afterend", TOC_BACKDROP);
		} else {
			TOC_BACKDROP.remove();
		}
	};

	if (TOC_TOGGLE_ELEM) {
		TOC_TOGGLE_ELEM.addEventListener("click", () => {
			toggleTocDropdown();
		});
	}
};
