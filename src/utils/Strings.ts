/**
 * Replaces placeholders in a string with corresponding values from an object.
 * @param template - The string containing placeholders to replace.
 * @param data - An object containing key-value pairs to replace placeholders in the template string.
 * @returns The formatted string with placeholders replaced by corresponding values from the data object.
 */
export function formatString(template: string, data: Record<string, any>): string {
	return template.replace(/{(\w+)}/g, (match, key) => (data.hasOwnProperty(key) ? String(data[key]) : match));
}
/**
 * Breaks a string into an array of phrases that are no longer than `N` characters
 * @param str The string to break into phrases
 * @param N The maximum number of characters per phrase
 * @returns An array of phrases that are no longer than `N` characters
 */
export function breakStringIntoPhrases(str: string, N: number): string[] {
	const words = str.split(" ");
	const phrases: string[] = [];
	let currentPhrase = "";

	for (let i = 0; i < words.length; i++) {
		const word = words[i];

		if (currentPhrase.length + word.length + 1 <= N) {
			// Add the word to the current phrase
			currentPhrase += (currentPhrase.length > 0 ? " " : "") + word;
		} else {
			// Add the current phrase to the array and start a new phrase with the current word
			phrases.push(currentPhrase);
			currentPhrase = word;
		}
	}

	// Add the last phrase to the array
	if (currentPhrase.length > 0) {
		phrases.push(currentPhrase);
	}

	return phrases;
}
