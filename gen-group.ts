import { stringify } from "jsr:@std/csv";
import { loadIDs } from "./lib.ts";
import { H, html } from "./html.ts";
import { BD } from "./bd.ts";

type Group = {
	id: string;
	name: string;
	type: string;
	contacts: string;
	isCertified: boolean;
	size: number;
	zip: string;
	city: string;
	creationDate: string;
};

const index = new Map<string, Group[]>();
for (const id of await loadIDs()) {
	const {
		name,
		isCertified,
		subtypes,
		location: { departement, city, zip },
		contact,
		facts: { creationDate, activeMemberCount: size },
	} = JSON.parse(
		await Deno.readTextFile("data/" + id + ".json"),
	);

	let d = index.get(departement);
	if (!d) {
		index.set(departement, d = []);
	}

	let type = "";
	for (const subtype of subtypes) {
		switch (subtype) {
			case "Groupe professionnel":
				type += "pro ";
				break;
			case "Groupe lycéens et étudiants":
				type += "jeune ";
				break;
			default:
				type += "x ";
		}
	}

	d.push({
		id,
		name,
		type,
		contacts: (contact || {}).name || "",
		isCertified,
		size,
		city,
		zip,
		creationDate,
	});
}

await Deno.mkdir("public", { recursive: true });
const collar = new Intl.Collator("fr", { sensitivity: "base" });
for (const [departement, groups] of index) {
	groups.sort((a, b) =>
		collar.compare(a.city, b.city) || collar.compare(a.name, b.name)
	);

	const certified = groups.filter((g) => g.isCertified).length;

	await Deno.writeTextFile(
		`public/${departement}.csv`,
		stringify(groups, {
			columns: [
				"zip",
				"city",
				"type",
				"isCertified",
				"size",
				"creationDate",
				"name",
				"contacts",
				"id",
			],
		}),
	);

	await Deno.writeTextFile(
		`public/${departement}.html`,
		`<!DOCTYPE html>` +
			`<html lang=fr>` +
			`<head>` +
			`<meta charset=utf-8>` +
			`<meta name=viewport content="width=device-width,initial-scale=1.0">` +
			`<style>` +
			`body{font-family:sans}` +
			`a.bd{display:table;margin:2ex 0}` +
			`table{border-collapse:collapse}` +
			`td,th{border:solid 1px}` +
			`tr:hover{background:#BBB}` +
			`</style>` +
			html("title", departement) +
			`</head>` +
			html(
				"body",
				html(
					"h1",
					`Département ${departement} (${groups.length} groupes, ${certified} certifiés)`,
				),
				(() => {
					const bd = BD.get(departement);
					return bd
						? new H(
							`<a class=bd href=https://actionpopulaire.fr/groupes/${bd}/ >Boucle départementale ~&gt;</a>`,
						)
						: "";
				})(),
				html(
					"table",
					html(
						"tr",
						html("th", "Certifié"),
						html("th", "Nb"),
						html("th", "Type"),
						html("th", "Création"),
						html("th", "Ville"),
						html("th", "Groupe"),
						html("th", "Animateur·ices"),
						html("th", "ID"),
					),
					...groups.map((g) =>
						html(
							"tr",
							html("td", g.isCertified ? "oui" : ""),
							html("td", g.size),
							html("td", g.type),
							html("td", g.creationDate.split("T")[0]),
							html("td", g.zip, " - ", g.city),
							html(
								"td",
								g.name,
								" ",
								new H(
									`<a href=https://actionpopulaire.fr/groupes/${g.id}/ >~&gt;</a>`,
								),
							),
							html("td", g.contacts),
							html("td", g.id),
						)
					),
				),
				new H(
					`<!--\n\nrm -f data/{index,${
						groups.map((g) => g.id).join()
					}}.json\n\n-->`,
				),
			),
	);
}
