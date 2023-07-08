<script lang="ts">
	import { writable } from "svelte/store";

	interface User {
		char: string;
		dir: number;
		score: number;
		energy: number;
		speed: number;
	}

	export let map: string[];
	export let users: [User, User];
	export let human: number;
	export let computer_speed: number;
	export let started: number;
	$: background = map.map((row) => row.replace(/[^#*.]/g, " "));
	$: friends = extract_friends(map);
	let left = -1;
	setInterval(() => {
		if (started) {
			left = Math.round((started + 60_000 - Date.now()) / 1000);
			if (left < 0) {
				left = 0;
			}
		}
	}, 200);

	const rows = map.length;
	const cols = map[0].length;
	const size = 32;

	let offset_x = writable(0);
	let offset_y = writable(0);
	let left_bound = 0,
		right_bound = 0,
		top_bound = 0,
		bottom_bound = 0;

	let screen: HTMLDivElement;
	$: {
		if (screen) {
			left_bound = 0;
			right_bound = screen.scrollWidth - screen.clientWidth;
			top_bound = 0;
			bottom_bound = screen.scrollHeight - screen.clientHeight;
			console.log({
				left_bound,
				right_bound,
				top_bound,
				bottom_bound,
			});
		}
	}

	// $: {
	// 	if (focus && screen) {
	// 		$offset_x = Math.max(
	// 			left_bound,
	// 			Math.min((focus.x + 0.5) * size - screen.clientWidth / 2, right_bound),
	// 		);
	// 		$offset_y = Math.max(
	// 			top_bound,
	// 			Math.min((focus.y + 0.5) * size - screen.clientHeight / 2, bottom_bound),
	// 		);
	// 	}
	// }

	interface Friend {
		char: string;
		x: number;
		y: number;
	}

	function extract_friends(map: string[]): Friend[] {
		const friends: Friend[] = [];
		for (let i = 0; i < map.length; i++) {
			for (let j = 0; j < map[i].length; j++) {
				const char = map[i][j];
				if (/[^#*. ]/.test(char)) {
					friends.push({ char, x: j, y: i });
				}
			}
		}
		return friends.sort((a, b) => a.char.localeCompare(b.char));
	}

	function is_taker(char: string) {
		return human === 0 ? char === "A" : char === "B";
	}

	function is_tracker(char: string) {
		return "CDE".includes(char) || (human === 0 ? char === "B" : char === "A");
	}

	function speed(char: string) {
		if (char === "A" || char === "B") {
			const ghost_factor = is_taker(char) ? 1 : 1.2;
			return 1000 / (users[+!human].speed * ghost_factor);
		}

		return 1000 / computer_speed;
	}
</script>

<div bind:this={screen} class="h-full w-full overflow-hidden bg-slate-900">
	<div
		class="grid duration-300 ease-linear"
		style="grid-template-columns: repeat({cols}, 1fr); grid-template-rows: repeat({rows}, 1fr); transform: translate({-$offset_x}px, {-$offset_y}px);"
	>
		{#each background as row, i}
			{#each row as col, j (`${i}-${j}-${col}`)}
				<div
					class="flex items-center justify-center"
					style="width: {size}px; height: {size}px;"
				>
					{#if col === "#"}
						<div class="h-full w-full bg-blue-800" />
					{:else if col === "."}
						<div class="mask mask-circle h-1/4 w-1/4 bg-yellow-300" />
					{:else if col === "*"}
						<div class="mask mask-circle h-1/2 w-1/2 bg-amber-500" />
					{:else if col === " "}
						<!-- <div class="h-full w-full bg-slate-900" /> -->
					{:else}
						<div class="h-full w-full bg-red-500" />
					{/if}
				</div>
			{/each}
		{/each}

		{#each friends as friend (friend.char)}
			<div
				class="absolute ease-linear"
				style="top: {friend.y * size}px; left: {friend.x *
					size}px; transition-duration: {speed(friend.char)}ms;"
			>
				<div
					class="flex items-center justify-center"
					style="width: {size}px; height: {size}px;"
				>
					<div
						class="mask mask-hexagon h-3/4 w-3/4"
						class:bg-red-500={is_tracker(friend.char)}
						class:bg-cyan-500={is_taker(friend.char)}
					/>
					<div class="absolute inset-0 flex items-center justify-center text-white">
						{friend.char}
					</div>
				</div>
			</div>
		{/each}
	</div>

	<div
		class="pointer-events-none absolute right-0 top-0 m-1 flex w-32 select-none flex-col gap-1 rounded-lg bg-black bg-opacity-30 p-1 font-mono text-lg text-white"
	>
		<div class="flex w-full justify-between">
			<span class="font-mono"> A<sub>score</sub> </span>
			{users[0].score}
		</div>
		<div class="flex w-full justify-between">
			<span class="font-mono"> B<sub>score</sub> </span>
			{users[1].score}
		</div>
	</div>

	<div
		class="pointer-events-none absolute left-0 top-0 m-1 flex w-32 select-none flex-col gap-1 rounded-lg bg-black bg-opacity-30 p-1 font-mono text-lg text-white"
	>
		<div class="flex w-full justify-between">
			<span class="font-mono"> A<sub>energy</sub> </span>
			{users[0].energy}
		</div>
		<div class="flex w-full justify-between">
			<span class="font-mono"> B<sub>energy</sub></span>
			{users[1].energy}
		</div>
	</div>

	{#if left !== -1}
		<div
			class="pointer-events-none absolute bottom-0 right-0 m-1 flex w-16 select-none flex-col gap-1 rounded-lg bg-black bg-opacity-30 p-1 font-mono text-lg text-white"
		>
			<div class="flex w-full justify-between">
				<span class="font-mono">
					{left}<sub>s</sub>
				</span>
			</div>
		</div>
	{/if}
</div>
