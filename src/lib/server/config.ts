import { env } from "$env/dynamic/private";

export const PEA_APP = (() => {
	try {
		if (!env.PEA_APP) {
			throw new Error();
		}

		return new URL(env.PEA_APP);
	} catch {
		return new URL("https://pea.csie.cool/app/take-and-run");
	}
})();
