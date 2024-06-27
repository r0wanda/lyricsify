import got, { type OptionsInit } from 'got'
import type { Provider, SearchParams } from './Provider.js'
import { load as cheerio } from 'cheerio'
import { htmlUnescape as decode } from 'escape-goat'
import { normalizeString, removeTags } from '../utils/lrc.js'
import UserAgent from 'user-agents'

const BASE_URL = 'https://www.lyricsify.com/'

const config: OptionsInit = {
	headers: {
		'User-Agent': new UserAgent().toString(),
		// 'Content-Type': 'application/x-www-form-urlencoded',
		'Accept-Encoding': 'text/html; charset=UTF-8',
		// 'Content-Encoding': 'br',
		'Content-Type': 'text/html; charset=utf-8',
		'Accept-Language': 'en-GB,en;q=0.9,en-US;q=0.8,hr;q=0.7',
		Accept:
			'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
		Referer: 'https://www.lyricsify.com/',
	},
	responseType: 'text'
}

export class Lyricsify implements Provider {
	async #getLink(artist: string, name: string) {
		const normalizedArtist = normalizeString(artist)
		const normalizedName = normalizeString(name)
		const query = encodeURIComponent(artist + ' ' + name)
		// @ts-ignore
		// typescript tweaking out
		const data = await got(BASE_URL + 'search?q=' + query, config).text();
		const $ = cheerio(data);
		const list = [...$('.li')
			.map((_i, item) => {
				const row = $(item).find('.title');
				return { title: row.text().toLowerCase(), link: row.attr('href') };
			})];
		const match = list.find((items) => {
			return (
				normalizeString(items.title?.toLowerCase()).includes(normalizedArtist) &&
				normalizeString(items.title?.toLowerCase()).includes(normalizedName)
			);
		});
		return match?.link;
	}

	async #getLrc(link: string) {
		const id: string = link.substring(link.lastIndexOf('.') + 1)
		// @ts-ignore
		const result = await got(BASE_URL + link, config).text();
		const $ = cheerio(result);
		const lrc = $(`#lyrics_${id}_details`);
		const decoded = decode(lrc.text());
		if (decoded.length) {
			const parse = removeTags(decoded).toString();
			return parse;
		}
	}

	async getBestMatched({ rawName, rawArtist }: SearchParams) {
		const name = rawName.toLowerCase();
		const artist = rawArtist.toLowerCase();
		const link = await this.#getLink(artist, name);
		if (link) {
			const lrc = await this.#getLrc(link);
			return lrc;
		}
		return '';
	}
}
