export const iconSprite = (name, width = 24, height = 24) => {
	return `<svg class="pointer-events-none" width=${width} height=${height}>
                <use xlink:href="/img/svg-sprite.svg#${name}"></use>
            </svg>`;
};
