import {
	html,
	htmlAttr,
	htmlRoot,
	htmlSec,
} from "https://jsr.io/@huguesguilleus/html/1.1.1/html.ts";
import { loadIDs } from "./lib.ts";

// Merge events
const all = new Map<string, number>();
for (const id of await loadIDs()) {
	const { results = [] } = JSON.parse(
		await Deno.readTextFile("data-event/" + id + ".json"),
	);
	for (const event of results) {
		const date = event.startTime.replace(/T.*/, "");
		all.set(
			date,
			all.getOrInsert(date, 0) + 1,
		);
	}
}

// Complete with day without action.
for (
	let date = new Date("2018-01-01");
	date < new Date("2026-12-31");
	date = new Date(date.valueOf() + 24 * 3600 * 1000)
) {
	all.getOrInsert(
		`${date.getFullYear()}-${
			(date.getMonth() + 1).toString().padStart(2, "0")
		}-${date.getDate().toString().padStart(2, "0")}`,
		0,
	);
}

// Generate
const allKeys = Array.from(all.keys()).sort();
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
				`.timeline{display:flex;align-items:flex-end;width:100%}`,
				`.date{background:#D1271C;flex-grow:2}`,
				`.date:hover{background:#4C0297}`,
				`#title{color:#4C0297;font-size:xx-large;top:0;right:0;position:fixed}`,
			),
		),
		html(
			"body",
			html("h1", "Évènements par date"),
			html("div id=title", ""),
			...(function* () {
				for (let year = 2018; year <= 2026; year++) {
					yield html("h2", year + "");
					const start = year + "-";
					const keys = allKeys.filter((date) =>
						date.startsWith(start)
					);

					yield html(
						"div",
						html(
							"div.timeline",
							keys.map((date) =>
								htmlAttr`div.date style=height:${
									all.get(date) + ""
								}px title='${date} (${all.get(date) + ""})'`()
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
