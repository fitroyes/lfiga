export type Group = {
	id: string;
	name: string;
	type: string;
	subtype:
		| 1 // groupe normal
		| 134 // groupe jeunes
		| 133 // groupe pro
		| 50
		| 62; // Pôle / Groupe fonctionnel à Paris
	location_country: string;
};

export const INDEX_PATH = "data/index.json";

export async function loadIDs(): Promise<string[]> {
	const index = JSON.parse(
		await Deno.readTextFile(INDEX_PATH),
	) as Group[];

	const ids = new Set<string>();
	for (const group of index) {
		if (group.location_country != "FR") continue;
		ids.add(group.id);
	}

	return [...ids].sort();
}
