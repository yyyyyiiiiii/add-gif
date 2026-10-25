export type GifboxMedia = {
  url: string
  dims: Array<number>
  duration: number
  size: number
}

export type GifboxMediaFormats = {
  mp4: GifboxMedia
  gif: GifboxMedia
  preview: GifboxMedia
  webm: GifboxMedia
  mediumgif: GifboxMedia
  loopedmp4: GifboxMedia
  tinymp4: GifboxMedia
  nanomp4: GifboxMedia
  tinywebm: GifboxMedia
  nanowebm: GifboxMedia
}

export type GifboxItem = {
  id: string
  title: string
  media_formats: GifboxMediaFormats
  created: number
  content_description: string
  itemurl: string
  url: string
  tags: Array<string>
  flags: Array<string>
  hasaudio: boolean
}

export type GifboxItems = {
  results: Array<GifboxItem>
  next: string
}

export async function GifboxSearch(key: string, query: string): Promise<GifboxItems> {
  const response = await fetch(`https://compat.gifbox.me/v2/search?key=${key}&q=${query}`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const data = (await response.json()) as GifboxItems
  return data
}
