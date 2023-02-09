// --------------------------------------------------
// Dynamic sidebar scroll on non read-mode.
// This'll allow the sidebar to display all content,
// without scrolling the body.
// --------------------------------------------------
const SIDEBAR_ELEM = document.getElementById("sidebar");

export const setSidebarHeight = () => {
	const ROOT = document.documentElement;
	const HEADER_ELEM = document.getElementById("header");

	let headerViewHeight = HEADER_ELEM.clientHeight + 48 - ROOT.scrollTop; // 48 = height of platform menu bar
	let sidebarHeight = headerViewHeight > 0 ? `calc(100vh - ${headerViewHeight}px)` : "100vh";
	let sidebarReadModeHeight = window.innerWidth > 991 ? sidebarHeight : "100vh";

	if (!ROOT.classList.contains("read-mode")) {
		SIDEBAR_ELEM.style.setProperty("height", sidebarHeight);
	} else {
		SIDEBAR_ELEM.style.setProperty("height", sidebarReadModeHeight);
	}
};

export const sidebar = () => {
	if (SIDEBAR_ELEM) {
		setTimeout(() => {
			setSidebarHeight();
		}, 100);

		document.addEventListener("scroll", (e) => {
			setSidebarHeight();
		});

		// Open/close on mobile
		const SIDEBAR_OPEN_ELEM = document.getElementById("sidebar-open");
		const SIDEBAR_CLOSE_ELEM = document.getElementById("sidebar-close");

		const closeSidebar = () => {
			SIDEBAR_ELEM.classList.add("hidden");
			SIDEBAR_BACKDROP.remove();
		};

		const SIDEBAR_BACKDROP = document.createElement("div");
		SIDEBAR_BACKDROP.setAttribute("class", "fixed left-0 top-0 w-full h-full z-10 bg-black/50 lg:hidden z-[9] cursor-pointer");
		SIDEBAR_BACKDROP.onclick = () => {
			closeSidebar();
		};

		SIDEBAR_OPEN_ELEM.addEventListener("click", () => {
			SIDEBAR_ELEM.classList.remove("hidden");

			if (!SIDEBAR_BACKDROP.parentElement) {
				SIDEBAR_ELEM.insertAdjacentElement("afterend", SIDEBAR_BACKDROP);
			}
		});

		SIDEBAR_CLOSE_ELEM.addEventListener("click", () => {
			closeSidebar();
		});
	}
};
