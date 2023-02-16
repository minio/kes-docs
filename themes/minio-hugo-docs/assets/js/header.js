import { setSidebarHeight } from "./sidebar";
import { iconSprite } from "./utils";
const ROOT = document.documentElement;
const BODY = document.body;

export const header = () => {
	// -----------------------------------------------
	// Toggle top navigation on mobile and read mode
	// -----------------------------------------------
	const NAV_OPEN_ELEM = document.getElementById("nav-toggle");
	const NAV_CLOSE_ELEM = document.getElementById("nav-close");
	const TOP_NAV_ELEM = document.getElementById("top-navigation");

	const closeNav = () => {
		TOP_NAV_ELEM.classList.add("rm:hidden");
		backdrop.remove();
		BODY.classList.remove("h-screen", "overflow-hidden");
	};

	const backdrop = document.createElement("div");
	backdrop.setAttribute("class", "fixed left-0 top-0 w-full h-full z-10 bg-black/25 dark:bg-[#10151c40] cursor-pointer");
	backdrop.onclick = () => {
		closeNav();
	};

	if (TOP_NAV_ELEM) {
		NAV_OPEN_ELEM.addEventListener("click", () => {
			BODY.classList.add("h-screen", "overflow-hidden");
			TOP_NAV_ELEM.classList.remove("rm:hidden");
			NAV_OPEN_ELEM.insertAdjacentElement("afterend", backdrop);
		});

		NAV_CLOSE_ELEM.addEventListener("click", () => {
			closeNav();
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
		ROOT.classList.toggle("dark", isDarkModeActive);
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
	let isReadModeActive = JSON.parse(localStorage.getItem("read-mode")) || false;

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

	const resize = () => {
		if (window.innerWidth < 1280) {
			ROOT.classList.add("read-mode");
		} else {
			if (!isReadModeActive) {
				ROOT.classList.remove("read-mode", !isReadModeActive);
			}
		}

		// re-set sidebar scroll height
		setSidebarHeight();
	};

	resize();
	window.addEventListener("resize", resize);
};
