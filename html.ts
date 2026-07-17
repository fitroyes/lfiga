import { escape } from "jsr:@std/html@^1.0.0";

// HTML, already exacped.
export class H extends String {}

/**
 * Create a html element.
 * @param tag The tag with escaped attributes
 * @param children children. Is simple string, auto escape it.
 * @returns The Html element.
 */
export function html(tag: string, ...children: unknown[]): H {
	let h = `<${tag}>`;
	for (const child of children) {
		if (child instanceof H) {
			h += child;
		} else {
			h += escape(child + "");
		}
	}
	switch (tag) {
		case "hr":
		case "br":
		case "body":
			return new H(h);
		default:
			return new H(h += `</${tag.split(".")[0]}>`);
	}
}
