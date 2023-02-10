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
		extend: {
			colors: {
				light: {
					0: "#ffffff",
					100: "#F5F5F5",
					200: "#EFF0F1",
					300: "#E8EAEC",
					400: "#E1E3E6",
					500: "#D9DDE2",
				},
				dark: {
					0: "#19202A",
					100: "#212936",
					200: "#273140",
					300: "#2E394A",
					400: "#59667A",
					500: "#8A93A4",
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
			backgroundColor: {
				header: "var(--header-bg)",
			},
			textColor: {
				body: "var(--text-color)",
				muted: "var(--text-muted-color)",
				heading: "var(--headings-color)",
			},
			maxWidth: {
				container: "1400px",
			},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: "100%",
						color: "var(--text-color)",
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
			addVariant("drm", ":merge(html.read-mode.dark) &");
		}),
		require("@tailwindcss/typography"),
	],
};
