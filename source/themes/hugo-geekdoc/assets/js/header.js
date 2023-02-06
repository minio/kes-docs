import { setSidebarHeight } from "./sidebar";
import { iconSprite } from "./utils";
const ROOT = document.documentElement;

export const header = () => {
	// -----------------------------------------------
	// Toggle top navigation on mobile and read mode
	// -----------------------------------------------
	const NAV_TOGGLE_ELEM = document.getElementById("nav-toggle");
	const TOP_NAV_ELEM = document.getElementById("top-navigation");

	const backdrop = document.createElement("div");
	backdrop.setAttribute("class", "fixed left-0 top-0 w-full h-full z-10 bg-black bg-opacity-50");
	backdrop.onclick = () => {
		TOP_NAV_ELEM.classList.add("rm:hidden");
		backdrop.remove();
	};

	if (NAV_TOGGLE_ELEM) {
		NAV_TOGGLE_ELEM.addEventListener("click", () => {
			TOP_NAV_ELEM.classList.remove("rm:hidden");
			NAV_TOGGLE_ELEM.insertAdjacentElement("afterend", backdrop);
		});
	}

	// -----------------------------------------------
	// Dark mode
	// -----------------------------------------------
	const DM_ELEM = document.getElementById("toggle-dark-mode");
	let isDarkModeActive = JSON.parse(localStorage.getItem("dark-mode")) || false;

	const renderDarkModeBtn = () => {
		const DM_ICON = isDarkModeActive ? iconSprite("sun", 17, 17) : iconSprite("moon", 21, 21);
		localStorage.setItem("dark-mode", isDarkModeActive);
		ROOT.classList.toggle("dark-mode", isDarkModeActive);
		DM_ELEM.innerHTML = DM_ICON;
	};

	if (DM_ELEM) {
		DM_ELEM.addEventListener("click", () => {
			isDarkModeActive = !isDarkModeActive;
			renderDarkModeBtn();
		});

		renderDarkModeBtn();
	}

	// -----------------------------------------------
	// Read mode
	// -----------------------------------------------
	const RM_ELEM = document.getElementById("toggle-read-mode");
	var isReadModeActive = JSON.parse(localStorage.getItem("read-mode")) || false;

	const renderReadModeBtn = () => {
		localStorage.setItem("read-mode", isReadModeActive);
		ROOT.classList.toggle("read-mode", isReadModeActive);
		rmIcon = isReadModeActive ? iconSprite("book-active", 17, 15) : iconSprite("book", 17, 15);
		RM_ELEM.innerHTML = rmIcon;

		// Set sidebar scroll height
		setSidebarHeight();
	};

	if (RM_ELEM) {
		RM_ELEM.addEventListener("click", () => {
			isReadModeActive = !isReadModeActive;
			renderReadModeBtn();
		});

		renderReadModeBtn();
	}
};
