import { INDEX_PATH, loadIDs } from "./lib.ts";
import { exists } from "https://deno.land/std@0.224.0/fs/mod.ts";

await Deno.mkdir("data", { recursive: true });
if (!await exists(INDEX_PATH)) {
	await fetchText(
		INDEX_PATH,
		"https://actionpopulaire.fr/carte/liste_groupes/?type=L&withrecent=true&withcertified=true",
	);
}

for (const id of await loadIDs()) {
	const path = "data/" + id + ".json";
	if (await exists(path)) continue;
	console.log(id);

	await fetchText(path, `https://actionpopulaire.fr/api/groupes/${id}/`);

	await new Promise((end) => setTimeout(end, 1000));
}

async function fetchText(path: string, url: string): Promise<void> {
	await Deno.writeTextFile(
		path,
		await fetch(url).then((r) => r.text()),
	);
}
