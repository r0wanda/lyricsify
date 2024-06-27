import { Provider, NetEase, QQMusic } from './providers/index.js'
import { normalizeLRC, normalizeString } from './utils/index.js'

interface LyricsResponse {
  success: boolean
  lyrics?: string
}

export const searchLyrics = async (rawName: string, rawArtist: string): Promise<LyricsResponse> => {
  // Remove the parenthetical contents.
  const name = normalizeString(rawName)
  // The algorithm to find a best matched lyrics is:
  //   1. Search for the artist (and get the unique id)
  //   2. Search for the songs and filter out the songs belonging to the artist
  // So, let's preserve only the first artist to let the algorithm work.
  const artist = normalizeString(rawArtist)
  if (!name || !artist) return { success: false }

  // Order by (the quality of the LRCs).
  const providers: Provider[] = [new NetEase(), new QQMusic()]

  // But still request in parallel...
  const promises = providers.map((provider) =>
    provider.getBestMatched({ name, artist, rawName, rawArtist }).catch(() => {})
  )

  for await (const lyrics of promises) {
    if (lyrics) {
      return { success: true, lyrics: normalizeLRC(lyrics) }
    }
  }
  return { success: false }
}
