import { loadIDs } from "./lib.ts";
import { exists } from "https://deno.land/std@0.224.0/fs/mod.ts";

await Deno.mkdir("data-event", { recursive: true });
for (const id of await loadIDs()) {
	const path = "data-event/" + id + ".json";
	if (await exists(path)) continue;

	console.log(id);
	const url =
		`https://actionpopulaire.fr/api/groupes/${id}/evenements/passes/?page_size=10000`;
	await Deno.writeTextFile(
		path,
		await fetch(url).then((r) => r.text()),
	);
}
