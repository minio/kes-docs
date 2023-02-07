/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
	content: ["./themes/hugo-geekdoc/**/*.{html,js}"],
	darkMode: "class",
	theme: {
		fontFamily: {
			sans: ["Inter"],
			mono: ["Menlo", "Courier New"],
		},
		fontSize: {
			xxxs: 6 / 16 + "rem",
			xxs: 9 / 16 + "rem",
			xs: 11 / 16 + "rem",
			sm: 13 / 16 + "rem",
			md: 15 / 16 + "rem",
			base: 17 / 16 + "rem",
			lg: 19 / 16 + "rem",
			xl: 21 / 16 + "rem",
			"2xl": "1.5rem",
			"3xl": "1.875rem",
			"4xl": "2.25rem",
			"5xl": "3rem",
			"6xl": "4rem",
		},
		container: {
			padding: "1.75rem",
			width: {
				"2xl": "1000px",
			},
		},
		extend: {
			colors: {
				gray: {
					50: "#FCFCFC",
					100: "#F7F7F7",
					200: "#dedede",
					300: "#c6c6c6",
					400: "#adadad",
					500: "#949494",
					600: "#7c7c7c",
					700: "#636363",
					800: "#4a4a4a",
					900: "#111111",
				},
				theme: {
					red: "#c72e49",
				},
			},
			borderRadius: {
				DEFAULT: "0.1875rem",
			},
			fontSize: {
				md: "0.9375rem",
			},
			textColor: {
				body: "#4b4b4b",
				muted: "#727272",
				heading: "#000000",
			},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: "100%",
						color: "#4b4b4b",
						h1: {
							fontSize: "1.75rem",
						},
						h2: {
							fontSize: "1.5rem",
						},
						h3: {
							fontSize: "1.25rem",
						},
						h4: {
							fontSize: "1rem",
						},
						h5: {
							fontSize: "1rem",
						},
						h6: {
							fontSize: "0.1rem",
						},
					},
				},
			},
		},
	},
	corePlugins: {
		container: false,
	},
	plugins: [
		plugin(function ({ addVariant }) {
			addVariant("rm", ":merge(html.read-mode) &");
			addVariant("nrm", ":merge(html:not(.read-mode)) &");
		}),
		require("@tailwindcss/typography"),
	],
};
