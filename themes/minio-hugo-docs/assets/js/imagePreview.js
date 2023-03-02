import { iconSprite } from "./utils";

export const imagePreview = () => {
	const IMG_ELS = document.querySelectorAll(".prose p img");
	const BODY = document.body;

	// Create a wrapper element to hold the image and close icon
	const WRAPPER = document.createElement("div");
	WRAPPER.setAttribute(
		"class",
		"fixed inset-0 z-50 bg-black/75 p-5 pt-12 flex items-center cursor-pointer opacity-0 transition-opacity duration-500 outline-none"
	);
	WRAPPER.setAttribute("tabindex", "0");
	WRAPPER.onclick = () => {
		hidePreview();
	};
	WRAPPER.addEventListener("keydown", (e) => {
		if (e.key === "Escape") {
			hidePreview();
		}
	});

	// Create a close icon
	const CLOSE_ICON = `<i class="fixed top-3 right-3 w-8 h-8 grid place-content-center rounded-full bg-white/20 hover:bg-white/30 text-white">
                            ${iconSprite("close", 10, 10)}
                        </i>`;

	// Show the image preview
	const showPreview = (src) => {
		BODY.appendChild(WRAPPER);
		WRAPPER.focus();
		WRAPPER.innerHTML = `<img src="${src}" class="rounded max-h-full m-auto" /> ${CLOSE_ICON}`;

		setTimeout(() => WRAPPER.classList.add("opacity-100"));
	};

	// Hide the image preview
	const hidePreview = () => {
		WRAPPER.classList.remove("opacity-100");
		setTimeout(() => {
			BODY.removeChild(WRAPPER);
		}, 500);
	};

	// Add click event listener to each image
	if (IMG_ELS.length > 0) {
		IMG_ELS.forEach((img) => {
			img.addEventListener("click", () => {
				showPreview(img.src);
			});
		});
	}
};
