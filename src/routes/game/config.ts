import { browser } from "$app/environment";
import { page } from "$app/stores";
import { get } from "svelte/store";

export const TIME = browser
	? parseInt(get(page).url.searchParams.get("time") || "60000") || 60_000
	: 60_000;
export const PLAYER1_ENERGY = browser
	? parseInt(get(page).url.searchParams.get("e1") || "0") || 0
	: 0;
export const PLAYER2_ENERGY = browser
	? parseInt(get(page).url.searchParams.get("e2") || "0") || 0
	: 0;
