export function normalizeLRC(lrc: string): string {
	// Some LRC timestamps are in a non-standard format [mm:ss.xxx],
	// and we should convert it to a standard form [mm:ss.xx].
	lrc = lrc.replace(/^\s*(\[\d{2}.\d{2}.)(\d{2})\d(\])/gm, (_$0, $1, $2, $3) => $1 + $2 + $3);
	return lrc;
}

export function normalizeString(str?: string) {
	if (!str) return ''
	return str
		.trim()
		.replace(/[,&].*/, '')
		.normalize('NFD')
		.replace(/([\u0300-\u036f])/g, '');
}

export function removeTags(str: string) {
	if (str === null || str === '') {
		return false;
	} else {
		str = str
			.toString()
			.replace(/(<([^>]+)>)/gi, '')
			.replace(/&lt;/g, '<')
			.replace(/&gt/g, '>')
			.replace(/&quot;/g, '"')
			.replace(/^\s*\n\n/gm, '')
			.replace(/&#039;/g, "'")
			.replace(/&amp;/g, '&');
	}
	const listStr = str.split('\n')
	const array: Array<string> = []
	listStr.forEach((items) => {
		if (items.substring(0, 9).includes('.')) {
			array.push(items);
		}
	});

	return array.join('\n');
}
