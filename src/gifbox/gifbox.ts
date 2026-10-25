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

// https://tenor.com/gifapi/documentation#:~:text=PARAMETERS,-NAME
export type GifboxSearchRequest = {
  key: string
  q: string
  locale?: string // xx_YY
  contentfilter?: string // basic | minimal
  ar_range?: string // all | wide | standard
  limit?: number // default: 20, max: 50
  pos?: string // value of next
  anon_id?: string // some tracking shit
}

export async function GifboxSearch(req: GifboxSearchRequest): Promise<GifboxItems> {
  let url = `https://compat.gifbox.me/v2/search?`
  for (const [key, value] of Object.entries(req)) {
    if (value !== null) {
      url += `&${key}=${value}`
    }
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = (await response.json()) as GifboxItems
  return data
}
