// --------------------------------------------------
// Dynamic sidebar scroll on non read-mode.
// This'll allow the sidebar to display all content,
// without scrolling the body.
// --------------------------------------------------
const SIDEBAR_ELEM = document.getElementById("sidebar");

export const setSidebarHeight = () => {
	const ROOT = document.documentElement;
	const HEADER_ELEM = document.getElementById("header");

	let headerViewHeight = HEADER_ELEM.clientHeight - ROOT.scrollTop;
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
	}
};
