import {
	html,
	htmlAttr,
	htmlRoot,
	htmlSec,
} from "https://jsr.io/@huguesguilleus/html/1.1.1/html.ts";
import { loadIDs } from "./lib.ts";

// Merge events
const types = new Map<string, number>();
const allPublic = new Map<string, number>();
const allPrivate = new Map<string, number>();
for (const id of await loadIDs()) {
	const { results = [] } = JSON.parse(
		await Deno.readTextFile("data-event/" + id + ".json"),
	);
	for (const event of results) {
		types.set(
			event.subtype.label,
			(types.get(event.subtype.label) ?? 0) + 1,
		);
		const date = event.startTime.replace(/T.*/, "");
		switch (event.subtype.type) {
			case "M":
			case "A":
				allPublic.set(date, (allPublic.get(date) ?? 0) + 1);
				break;
			case "G":
			case "O":
				allPrivate.set(date, (allPrivate.get(date) ?? 0) + 1);
				break;
			default:
				console.log("unknown event.subtype.type", event.subtype.type);
		}
	}
}
console.table(Array.from(types.entries()).sort(([_1, a], [_, b]) => b - a));

// Complete with day without action.
for (
	let date = new Date("2018-01-01");
	date < new Date("2026-12-31");
	date = new Date(date.valueOf() + 24 * 3600 * 1000)
) {
	const key = `${date.getFullYear()}-${
		(date.getMonth() + 1).toString().padStart(2, "0")
	}-${date.getDate().toString().padStart(2, "0")}`;
	allPublic.getOrInsert(key, 0);
	allPrivate.getOrInsert(key, 0);
}

// Generate
const allKeys = Array.from(allPublic.keys()).sort();
Deno.writeTextFile(
	"public/event.html",
	htmlRoot(
		"html lang=fr",
		html(
			"head",
			html("meta charset=utf-8"),
			html("title", "Évènements par date"),
			html(
				"style",
				`body{font-family:sans;color:#212320;background:#FFFCF4}`,
				`.timeline{display:flex;width:100%}`,
				`.date{background:#D1271C;flex-grow:2}`,
				`.pub{background:#D1271C;align-self:flex-end}`,
				`.priv{background:#4C0297}`,
				`.date:hover{background:dodgerblue}`,
				`#title{color:dodgerblue;font-size:xx-large;top:0;right:0;position:fixed}`,
			),
		),
		html(
			"body",
			html("h1", "Évènements par date"),
			html("div id=title", ""),
			html(
				"p",
				"En rouge les actions publiques, et en violet les autres (réunion de groupe...)",
			),
			...(function* () {
				for (let year = 2018; year <= 2026; year++) {
					const start = year + "-";
					const keys = allKeys.filter((date) =>
						date.startsWith(start)
					);
					const nb = keys.reduce(
						(acc: number, key) =>
							acc +
							(allPublic.get(key) ?? 0) +
							(allPrivate.get(key) ?? 0),
						0,
					);
					yield html("h2", `${year} (${nb})`);
					yield html(
						"div",
						html(
							"div.timeline",
							keys.map((date) =>
								htmlAttr`div.date.pub style=height:${
									allPublic.get(date) + ""
								}px title='${date} (${
									allPublic.get(date) + ""
								})'`()
							),
						),
					);
					yield html(
						"div",
						html(
							"div.timeline",
							keys.map((date) =>
								htmlAttr`div.date.priv style=height:${
									allPrivate.get(date) + ""
								}px title='${date} (${
									allPrivate.get(date) + ""
								})'`()
							),
						),
					);
				}
			})(),
		),
		html(
			"script",
			htmlSec`document.querySelectorAll(".date").forEach(d=>d.onmouseover=_=>title.innerText=d.title)`,
		),
	),
);
