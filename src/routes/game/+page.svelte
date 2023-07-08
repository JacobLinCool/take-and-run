<script lang="ts">
	import { browser } from "$app/environment";
	import { is_dot, is_empty, is_power, is_wall } from "$lib/game/take-and-run/utils";
	import { onDestroy, onMount } from "svelte";
	import Map from "./Map.svelte";
	import { PLAYER1_ENERGY, PLAYER2_ENERGY, TIME } from "./config";

	// let map = [
	// 	"###########################################################",
	// 	"#.........................................................#",
	// 	"#.####.####.#################.#################.####.####.#",
	// 	"#.####.####.#################.#################.####.####.#",
	// 	"#......####.##...............A...............##.####......#",
	// 	"#.####.####.##.#############################.##.####.####.#",
	// 	"#.####.####.##.#############################.##.####.####.#",
	// 	"#.####.....*##..............###.............*##......####.#",
	// 	"#.####.####.##.############.   .############.##.####.####.#",
	// 	"#.####.####.##.#..........#.   .#..........#.##.####.####.#",
	// 	"#.####.####.##.#....#.....#.   .#.....#....#.##.####.####.#",
	// 	"#.####.####.##.#....#.....#.   .#.....#....#.##.####.####.#",
	// 	"#..............#....#....... B .......#....#..............#",
	// 	"#.####.####.##.#....#.....#.   .#.....#....#.##.####.####.#",
	// 	"#.####.####.##.#....#.....#.   .#.....#....#.##.####.####.#",
	// 	"#.####.####.##.#..........#.   .#..........#.##.####.####.#",
	// 	"#.####.####.##.############.   .############.##.####.####.#",
	// 	"#.####.....*##..............###.............*##......####.#",
	// 	"#.####.####.##.#############################.##.####.####.#",
	// 	"#.####.####.##.#############################.##.####.####.#",
	// 	"#......####.##...............................##.####......#",
	// 	"#.####.####.#################.#################.####.####.#",
	// 	"#.####.####.#################.#################.####.####.#",
	// 	"#.........................................................#",
	// 	"###########################################################",
	// ];

	let map = [
		"################# #################",
		"#.................................#",
		"#.#.#####..####...#####.####...##.#",
		"#.#.#.....#.........#...#....#.##.#",
		"#.#.#......###......#...####.#.##.#",
		"#.#.#.........#.....#...#....#.##.#",
		"#.#.#####.####...A#####.####.#.##.#",
		"#.#..........................#.##.#",
		"#.##.##.###################.##.##.#",
		"#...*##.........###........*##....#",
		"#.##.##.#######.   .#######.##.##.#",
		"#.##.##.#.......   .......#.##.##.#",
		"#.##.##.#..#.##.   .##.#..#.##.##.#",
		"#.##.##.#..#.##.   .##.#..#.##.##.#",
		" .......#..#.... B ....#..#....... ",
		"#.##.##.#..#..#.   .#..#..#.##.##.#",
		"#.##.##.#.##..#.   .#..##.#.##.##.#",
		"#.##.##.#.....#.   .#.....#.##.##.#",
		"#.##.##.#######.   .#######.##.##.#",
		"#...*##.........###........*##....#",
		"#.##.##.###################.##..#.#",
		"#.##.##.........................#.#",
		"#.##.##.##..#.#####.##..#.#...#.#.#",
		"#.##.##.#.#.#...#...#.#.#.#...#.#.#",
		"#.##.##.#..##...#...#..##..###..#.#",
		"#.................................#",
		"################# #################",
	];

	function set(x: number, y: number, char: string) {
		if (char.length !== 1) {
			throw new Error("char must be a single character");
		}

		if (started && Date.now() < started + TIME) {
			map[y] = map[y].substring(0, x) + char + map[y].substring(x + 1);
		}
	}

	interface User {
		char: string;
		dir: number;
		score: number;
		energy: number;
		speed: number;
		powerup: boolean;
	}

	let users: [User, User] = [
		{
			char: "A",
			dir: 3,
			score: 0,
			energy: PLAYER1_ENERGY,
			speed: 4,
			powerup: false,
		},
		{
			char: "B",
			dir: 2,
			score: 0,
			energy: PLAYER2_ENERGY,
			speed: 4,
			powerup: false,
		},
	];
	let human = 0;
	let computer_speed = 4;

	let csr = false;
	let started = 0;
	onMount(() => {
		csr = true;

		window.addEventListener("keydown", keyboard);
	});
	onDestroy(() => {
		if (browser) {
			window.removeEventListener("keydown", keyboard);
		}
	});

	function is_taker(char: string) {
		return human === 0 ? char === "A" : char === "B";
	}

	function is_tracker(char: string) {
		return "CDE".includes(char) || (human === 0 ? char === "B" : char === "A");
	}

	function update(user: User) {
		if (!(started && Date.now() < started + TIME)) {
			return;
		}

		let x = 0,
			y = 0;

		for (let i = 0; i < map.length; i++) {
			const row = map[i];
			const j = row.indexOf(user.char);
			if (j !== -1) {
				x = j;
				y = i;
				break;
			}
		}

		let next_x = x,
			next_y = y;

		if (user.dir === 0) {
			next_y--;
		} else if (user.dir === 1) {
			next_y++;
		} else if (user.dir === 2) {
			next_x--;
		} else if (user.dir === 3) {
			next_x++;
		}

		next_x = (next_x + map[0].length) % map[0].length;
		next_y = (next_y + map.length) % map.length;

		if (!is_wall(map[next_y][next_x])) {
			if (is_taker(user.char)) {
				// taker
				if (is_empty(map[next_y][next_x])) {
					set(x, y, user.powerup ? "*" : " ");
					user.powerup = false;
					set(next_x, next_y, user.char);
				}
				if (is_dot(map[next_y][next_x])) {
					user.score += 10;
					users = users;
					set(x, y, user.powerup ? "*" : " ");
					user.powerup = false;
					set(next_x, next_y, user.char);
				} else if (is_power(map[next_y][next_x])) {
					human = 1 - human;
					user.score += 200;
					users = users;
					set(x, y, user.powerup ? "*" : " ");
					user.powerup = false;
					set(next_x, next_y, user.char);
				} else if (is_tracker(map[next_y][next_x])) {
					const left = Math.floor((user.score * 2) / 3);
					user.score = left;
					users = users;

					// put the taker to the farthest corner
					const taker = user.char;
					let farthest = 0;
					let farthest_x = 0;
					let farthest_y = 0;
					for (let i = 0; i < map.length; i++) {
						const row = map[i];
						for (let j = 0; j < row.length; j++) {
							if (is_empty(row[j]) || is_dot(row[j])) {
								const dist = Math.abs(next_x - j) + Math.abs(next_y - i);
								if (dist > farthest) {
									farthest = dist;
									farthest_x = j;
									farthest_y = i;
								}
							}
						}
					}
					set(farthest_x, farthest_y, taker);
					set(x, y, "*");
				}
			} else {
				// tracker
				if (is_taker(map[next_y][next_x])) {
					const left = Math.floor((users[human].score * 2) / 3);
					users[human].score = left;
					users = users;
					const taker = map[next_y][next_x];
					set(next_x, next_y, user.char);
					set(x, y, "*");

					// put the taker to the farthest corner
					let farthest = 0;
					let farthest_x = 0;
					let farthest_y = 0;
					for (let i = 0; i < map.length; i++) {
						const row = map[i];
						for (let j = 0; j < row.length; j++) {
							if (is_empty(row[j]) || is_dot(row[j])) {
								const dist = Math.abs(next_x - j) + Math.abs(next_y - i);
								if (dist > farthest) {
									farthest = dist;
									farthest_x = j;
									farthest_y = i;
								}
							}
						}
					}
					set(farthest_x, farthest_y, taker);
				} else if (is_power(map[next_y][next_x])) {
					human = 1 - human;
					user.score += 200;
					users = users;
				}
				if (!is_tracker(map[next_y][next_x])) {
					set(next_x, next_y, user.char);
					set(x, y, user.powerup ? "*" : ".");
					user.powerup = false;
				}
			}

			map = map;
		}

		const ghost_factor = is_taker(user.char) ? 1 : 1.2;

		console.log(user);

		setTimeout(() => update(user), 1000 / (user.speed * ghost_factor));
	}

	function keyboard(e: KeyboardEvent) {
		if (e.key === " ") {
			if (!started) {
				started = Date.now();
				update(users[0]);
				update(users[1]);
				// update_computers();
				console.log("started");
				return;
			}
		}

		if (started && Date.now() < started + TIME) {
			if (e.key === "ArrowUp") {
				users[1].dir = human === 1 ? 0 : 1;
			} else if (e.key === "ArrowDown") {
				users[1].dir = human === 1 ? 1 : 0;
			} else if (e.key === "ArrowLeft") {
				users[1].dir = human === 1 ? 2 : 3;
			} else if (e.key === "ArrowRight") {
				users[1].dir = human === 1 ? 3 : 2;
			} else if (e.key === "/") {
				if (users[1].energy > 0 && !users[1].powerup) {
					users[1].energy--;
					users[1].powerup = true;
				}
			} else if (e.key === "w") {
				users[0].dir = human === 0 ? 0 : 1;
			} else if (e.key === "s") {
				users[0].dir = human === 0 ? 1 : 0;
			} else if (e.key === "a") {
				users[0].dir = human === 0 ? 2 : 3;
			} else if (e.key === "d") {
				users[0].dir = human === 0 ? 3 : 2;
			} else if (e.key === "q") {
				if (users[0].energy > 0 && !users[0].powerup) {
					users[0].energy--;
					users[0].powerup = true;
				}
			}
		}
	}

	let targetted = 0;
	function update_computers() {
		const computers: { char: string; x: number; y: number }[] = [];
		for (let i = 0; i < map.length; i++) {
			const row = map[i];
			for (let j = 0; j < row.length; j++) {
				if ("CDE".includes(row[j])) {
					computers.push({ char: row[j], x: j, y: i });
				}
			}
		}

		let taker_x = 0,
			taker_y = 0;
		for (let i = 0; i < map.length; i++) {
			const row = map[i];
			for (let j = 0; j < row.length; j++) {
				if (is_taker(row[j])) {
					taker_x = j;
					taker_y = i;
				}
			}
		}

		// check if the computer can "see" the taker, if so, go towards it
		// otherwise, randomly move
		for (const com of computers) {
			if (!targetted) {
				const dirs = [
					[0, -1],
					[0, 1],
					[-1, 0],
					[1, 0],
				];

				const selected: number[][] = [];
				for (let i = dirs.length - 1; i > 0; i--) {
					const x = com.x + dirs[i][0];
					const y = com.y + dirs[i][1];
					if (x < 0 || x >= map[0].length || y < 0 || y >= map.length) {
						continue;
					}

					if (is_empty(map[y][x]) || is_dot(map[y][x])) {
						selected.push(dirs[i]);
					}
				}

				if (selected.length) {
					const dir = selected[Math.floor(Math.random() * selected.length)];
					const x = com.x + dir[0];
					const y = com.y + dir[1];
					set(x, y, com.char);
					set(com.x, com.y, ".");
				}
			} else {
				// ...
			}
		}

		if (targetted > 0) {
			targetted--;
		}

		setTimeout(update_computers, 1000 / computer_speed);
	}

	// function select_next_step_by_a_star(curr: [x: number, y: number], target: [x: number, y: number]): [x: number, y: number] {
	// 	const dirs = [
	// 		[0, -1],
	// 		[0, 1],
	// 		[-1, 0],
	// 		[1, 0],
	// 	];

	// 	const
	// }
</script>

<div class="flex h-full w-full items-center justify-center p-2">
	<div>
		{#if csr}
			<Map {map} {users} {human} {computer_speed} {started} />
		{/if}
	</div>
</div>
