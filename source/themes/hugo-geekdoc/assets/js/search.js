import groupBy from "lodash/groupBy";
import truncate from "lodash/truncate";
import { FlexSearch } from "flexsearch/dist/flexsearch.compact";
import { Validator } from "@cfworker/json-schema";
import { iconSprite } from "./utils";

const init = (input, searchConfig) => {
	input.removeEventListener("focus", init);

	const indexCfgDefaults = {
		tokenize: "forward",
	};
	const indexCfg = searchConfig.indexConfig ? searchConfig.indexConfig : indexCfgDefaults;
	const dataUrl = searchConfig.dataFile;

	indexCfg.document = {
		key: "id",
		index: ["title", "content", "description"],
		store: ["title", "href", "parent", "description"],
	};

	const index = new FlexSearch.Document(indexCfg);
	window.geekdocSearchIndex = index;

	getJson(dataUrl, function (data) {
		data.forEach((obj) => {
			window.geekdocSearchIndex.add(obj);
		});
	});
};

const search = (input, results, searchConfig) => {
	const searchCfg = {
		enrich: true,
		limit: 5,
	};

	while (results.firstChild) {
		results.removeChild(results.firstChild);
	}

	if (!input.value) {
		return results.classList.remove("has-hits");
	}

	let searchHits = flattenHits(window.geekdocSearchIndex.search(input.value, searchCfg));

	if (searchHits.length < 1) {
		const noResult = document.createElement("li");
		noResult.classList.add("p-3", "flex", "flex-col", "items-center", "text-center");
		noResult.innerHTML = `<div class="mb-3">${iconSprite("no-result", 40, 40)}</div>
								No results have been found, Please <br/>rephrase your query!`;
		results.appendChild(noResult);
		return results.classList.remove("has-hits");
	}

	results.classList.add("has-hits");

	if (searchConfig.showParent === true) {
		searchHits = groupBy(searchHits, (hit) => hit.parent);
	}

	const items = [];

	if (searchConfig.showParent === true) {
		for (const section in searchHits) {
			const item = document.createElement("li"),
				title = item.appendChild(document.createElement("span")),
				subList = item.appendChild(document.createElement("ul"));

			if (!section) {
				title.remove();
			}
			title.classList.add("gdoc-search__section");
			title.textContent = section;
			createLinks(searchHits[section], subList, searchConfig.showDescription);

			items.push(item);
		}
	} else {
		const item = document.createElement("li"),
			subList = item.appendChild(document.createElement("ul"));
		createLinks(searchHits, subList, searchConfig.showDescription);

		items.push(item);
	}

	items.forEach((item) => {
		results.appendChild(item);
	});
};

/**
 * Creates links to given fields and either returns them in an array or attaches them to a target element
 * @param {Object} fields Page to which the link should point to
 * @param {HTMLElement} target Element to which the links should be attatched
 * @returns {Array} If target is not specified, returns an array of built links
 */
const createLinks = (pages, target, showDesc) => {
	const items = [];

	for (const page of pages) {
		const item = document.createElement("li"),
			a = item.appendChild(document.createElement("a")),
			entry = a.appendChild(document.createElement("span"));

		a.href = page.href;
		entry.textContent = page.title;
		a.setAttribute("class", "text-black py-2 px-3 block hover:bg-slate-300/80 focus:outline-none focus:bg-slate-300/80 rounded");

		if (showDesc === true) {
			const desc = a.appendChild(document.createElement("span"));
			desc.setAttribute("gdoc-search__entry--description");
			desc.textContent = truncate(page.description, {
				length: 55,
				separator: " ",
			});
		}

		if (target) {
			target.appendChild(item);
			continue;
		}

		items.push(item);
	}

	return items;
};

const fetchErrors = (response) => {
	if (!response.ok) {
		throw Error("Failed to fetch '" + response.url + "': " + response.statusText);
	}
	return response;
};

function getJson(src, callback) {
	fetch(src)
		.then(fetchErrors)
		.then((response) => response.json())
		.then((json) => callback(json))
		.catch(function (error) {
			if (error instanceof AggregateError) {
				console.error(error.message);
				error.errors.forEach((element) => {
					console.error(element);
				});
			} else {
				console.error(error);
			}
		});
}

const flattenHits = (results) => {
	const items = [];
	const map = new Map();

	for (const field of results) {
		for (const page of field.result) {
			if (!map.has(page.doc.href)) {
				map.set(page.doc.href, true);
				items.push(page.doc);
			}
		}
	}

	return items;
};

const urlPath = (rawURL) => {
	var parser = document.createElement("a");
	parser.href = rawURL;

	return parser.pathname;
};

/**
 * Part of [axios](https://github.com/axios/axios/blob/master/lib/helpers/combineURLs.js).
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
const combineURLs = (baseURL, relativeURL) => {
	return relativeURL ? baseURL.replace(/\/+$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
};

export const siteSearch = () => {
	const input = document.querySelector("#search-input");
	const results = document.querySelector("#search-results");
	const basePath = urlPath(input ? input.dataset.siteBaseUrl : "");
	const lang = input ? input.dataset.siteLang : "";

	const configSchema = {
		type: "object",
		properties: {
			dataFile: {
				type: "string",
			},
			indexConfig: {
				type: ["object", "null"],
			},
			showParent: {
				type: "boolean",
			},
			showDescription: {
				type: "boolean",
			},
		},
		additionalProperties: false,
	};
	const validator = new Validator(configSchema);

	if (!input) return;

	getJson(combineURLs(basePath, "/search/" + lang + ".config.min.json"), function (searchConfig) {
		const validationResult = validator.validate(searchConfig);

		if (!validationResult.valid)
			throw AggregateError(
				validationResult.errors.map((err) => new Error("Validation error: " + err.error)),
				"Schema validation failed"
			);

		if (input) {
			input.addEventListener("focus", () => {
				init(input, searchConfig);
			});
			input.addEventListener("keyup", () => {
				search(input, results, searchConfig);
			});
		}
	});
};
