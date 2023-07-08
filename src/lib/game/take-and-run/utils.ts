export function is_ghost(char: string): char is "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" {
	return ["A", "B", "C", "D", "E", "F", "G", "H"].includes(char);
}

export function is_human(char: string): char is "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" {
	return ["1", "2", "3", "4", "5", "6", "7", "8"].includes(char);
}

export function is_wall(char: string): char is "#" {
	return char === "#";
}

export function is_empty(char: string): char is " " {
	return char === " ";
}

export function is_dot(char: string): char is "." {
	return char === ".";
}

export function is_power(char: string): char is "*" {
	return char === "*";
}

export function char2index(char: string): number {
	return "1A2B3C4D5E6F7G8H".indexOf(char);
}

export function index2char(index: number): string {
	return "1A2B3C4D5E6F7G8H"[index];
}
