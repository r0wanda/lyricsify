import { createURLWithQuery, defaultTimeout } from '../utils/request.js'
import type { Provider, SearchParams } from './Provider.js'
import got from 'got';
import UserAgent from 'user-agents';

const BASE_URL = 'https://music.163.com/api/';

interface ArtistInfo {
	id: number;
	name: string;
}

const getRandomHex = (length: number, randHex = () => (Math.random() * 0xfffff * 1000000).toString(16)): string => length % 2 ? randHex().slice(1) : randHex();

const randomCookies = (musicU: string): string => {
	const CookiesList = [
		'os=pc; osver=Microsoft-Windows-10-Professional-build-10586-64bit; appver=2.0.3.131777; channel=netease; __remember_me=true',
		// 'MUSIC_U'+ musicU +'; buildver=1506310743; resolution=1920x1080; mobilename=MI5; osver=7.0.1; channel=coolapk; os=android; appver=4.2.0',
		'osver=%E7%89%88%E6%9C%AC%2010.13.3%EF%BC%88%E7%89%88%E5%8F%B7%2017D47%EF%BC%89; os=osx; appver=1.5.2; MUSIC_U=' +
		musicU +
		'; channel=netease;',
	]
	const num = Math.floor(Math.random() * CookiesList.length)
	return CookiesList[num]
}

const headers = {
	Accept: '*/*',
	'Content-Type': 'application/x-www-form-urlencoded',
	Connection: 'keep-alive',
	// Cookie: 'NMTID=',
	'User-Agent': new UserAgent().toString(),
	// 'Content-Type': 'application/x-www-form-urlencoded',
	'Accept-Encoding': 'gzip, deflate, sdch',
	Referer: 'http://music.163.com',
	Host: 'music.163.com',
}

export class NetEase implements Provider {
	#body2url(path: string, body: object) {
		const url = new URL(path, BASE_URL);
		for (const k in body) url.searchParams.set(k, (<string>body[<keyof object>k]).toString());
		return url.toString();
	}
	async #getArtistInfo(artist: string): Promise<ArtistInfo | undefined> {
		try {
			const body = {
				s: artist,
				limit: 1,
				type: '100',
			}
			const response = await got(this.#body2url('search/get', body), {
				timeout: {
					response: defaultTimeout
				},
				headers: headers
			});
			if (!response.body || response.statusCode !== 200) return;
			const matchedArtist = JSON.parse(response.body.toString()).artists?.[0];
			if (!matchedArtist) return;
			return {
				id: matchedArtist.id,
				name: matchedArtist.name,
			}
		} catch (error) {
			// console.log('error 1', error)
			return;
		}
	}

	async getBestMatched({ name, artist }: SearchParams) {
		const artistInfo = await this.#getArtistInfo(artist)
		if (!artistInfo) return
		const body = {
			s: [name, artistInfo.name].join(' '),
			limit: '10',
			type: '1',
		}
		try {
			const response = await got(this.#body2url('search/get', body), {
				timeout: {
					response: defaultTimeout,
				},
				headers,
			});
			// console.log('response song', response)
			if (!response.body || response.statusCode !== 200) return;
			const songs = JSON.parse(response.body.toString()).result.songs;
			const matchedSongs = songs.filter((song: any) => song.artists.some((artist: any) => artist.id === artistInfo.id));
			//console.log('matched songs ', matchedSongs)
			const matchedSong = matchedSongs.find((song: any) => String(song.name).includes(name)) ?? matchedSongs[0];
			//console.log('matched song', matchedSong)
			if (!matchedSong) return;

			const response2 = await got(
				createURLWithQuery(new URL('song/lyric', BASE_URL), {
					id: String(matchedSong.id),
					lv: '1',
				}),
				{
					timeout: {
						response: defaultTimeout
					}
				}
			);
			if (!response2.body) return
			const lrc = JSON.parse(response2.body.toString()).lrc;
			if (!lrc) return;
			return lrc.lyric;
		} catch (error) {
			return;
		}
	}
}
