import { PEA_APP } from "$lib/server/config";
import { locale, waitLocale } from "svelte-i18n";
import { checkout } from "sveltekit-jwt";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	const lang = event.request.headers.get("accept-language")?.split(",")[0] || "en";
	locale.set(lang);
	await waitLocale(lang);

	const payload = await checkout(event);
	if (payload && payload.sub && payload.iss === PEA_APP.hostname) {
		event.locals.email = payload.sub;
	}

	const result = await resolve(event);
	return result;
};

// process.on("SIGINT", () => process.exit(0));
// process.on("SIGTERM", () => process.exit(0));
