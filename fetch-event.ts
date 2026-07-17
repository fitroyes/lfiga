// https://actionpopulaire.fr/api/groupes/dffe29a7-2fcb-424e-bb3d-b1d2b4623aaf/evenements/passes/?page=1&page_size=3

import { loadIDs } from "./lib.ts";
import { exists } from "https://deno.land/std@0.224.0/fs/mod.ts";

await Deno.mkdir("data-event", { recursive: true });
for (const id of await loadIDs()) {
	const path = "data-event/" + id + ".json";
	if (await exists(path)) continue;

	console.log(id);
	const url =
		`https://actionpopulaire.fr/api/groupes/${id}/evenements/passes/`;
	await Deno.writeTextFile(
		path,
		await fetch(url).then((r) => r.text()),
	);
}
