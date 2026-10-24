type Media = Array<{
  url: string
  dims: Array<number>
  duration: number
  size: number
}>

type MediaFormats = {
  mp4: Media
  gif: Media
  preview: Media
  webm: Media
  mediumgif: Media
  loopedmp4: Media
  tinymp4: Media
  nanomp4: Media
  tinywebm: Media
  nanowebm: Media
}

type SearchResult = {
  results: Array<{
    id: string
    title: string
    media_formats: MediaFormats
    created: number
    content_description: string
    itemurl: string
    url: string
    tags: Array<string>
    flags: Array<string>
    hasaudio: boolean
  }>
  next: string
}

export default async function search(key: string, query: string): Promise<SearchResult> {
  const response = await fetch(`https://compat.gifbox.me/v2/search?key=${key}&q=${query}`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const data = (await response.json()) as SearchResult
  return data
}
