export function random_string(length: number) {
	const dictionary = "abcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";

	for (let i = 0; i < length; i++) {
		result += dictionary.charAt(Math.floor(Math.random() * dictionary.length));
	}

	return result;
}
