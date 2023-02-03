import { iconSprite } from "./utils";

export const readMode = () => {
	const ROOT = document.documentElement;
	const RM_ELEM = document.getElementById("toggle-read-mode");
	var readMode = JSON.parse(localStorage.getItem("read-mode")) || false;

	const renderReadModeBtn = () => {
		localStorage.setItem("read-mode", readMode);
		ROOT.classList.toggle("read-mode", readMode);
		rmIcon = readMode ? iconSprite("book-active", 22, 21) : iconSprite("book", 18, 17);
		RM_ELEM.innerHTML = rmIcon;
	};

	RM_ELEM.addEventListener("click", () => {
		readMode = !readMode;
		renderReadModeBtn();
	});

	renderReadModeBtn();
};
