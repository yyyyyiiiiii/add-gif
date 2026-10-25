import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, JSX, ReactNode, UIEvent } from 'react'
import type { GifboxItems } from '../../gifbox/gifbox'

type SearchState = {
  req: boolean
  query: string
  next?: string
  append?: boolean
}

type PendingRequest = {
  query: string
  append: boolean
}

function App(): JSX.Element {
  const [searchState, setSearchState] = useState<SearchState>({
    req: false,
    query: ''
  })
  const [gifboxItems, setGifboxItems] = useState<GifboxItems>()

  const pendingRequest = useRef<PendingRequest | null>(null)

  useEffect(() => {
    const handleSearchResult = (_event: unknown, items: GifboxItems): void => {
      const request = pendingRequest.current
      if (!request) return

      if (request.append) {
        setGifboxItems((currentItems) => ({
          results: [...(currentItems?.results ?? []), ...items.results],
          next: items.next
        }))
      } else {
        setGifboxItems(items)
      }

      pendingRequest.current = null
      setSearchState((current) => ({ ...current, req: false }))
    }

    const handleSearchError = (_event: unknown, error: unknown): void => {
      console.error('Search error received:', error)
      pendingRequest.current = null
      setSearchState((current) => ({ ...current, req: false }))
    }

    window.electron.ipcRenderer.on('search-result', handleSearchResult)
    window.electron.ipcRenderer.on('search-error', handleSearchError)

    return () => {
      window.electron.ipcRenderer.removeListener('search-result', handleSearchResult)
      window.electron.ipcRenderer.removeListener('search-error', handleSearchError)
    }
  }, [])

  useEffect(() => {
    if (!searchState.req || searchState.query.trim() === '') return

    pendingRequest.current = {
      query: searchState.query,
      append: searchState.append ?? false
    }

    window.electron.ipcRenderer.send('search', searchState.query, searchState.next)
  }, [searchState])

  const loadMore = (event: UIEvent<HTMLDivElement>): void => {
    const list = event.currentTarget
    const nearBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 200

    if (!nearBottom || searchState.req || !gifboxItems?.next || !searchState.query) {
      return
    }

    setSearchState({
      req: true,
      query: searchState.query,
      next: gifboxItems.next,
      append: true
    })
  }

  const inputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const query = event.target.value
    setGifboxItems(undefined)

    setSearchState({
      req: query.trim() !== '',
      query
    })
  }

  const itemsGrid = (items: GifboxItems | undefined): ReactNode => {
    if (!items) return null

    return (
      <div className="gif-list-container" onScroll={loadMore}>
        {items.results.map((item) => (
          <div className="gif-tile" key={item.id}>
            <video
              src={item.media_formats.webm.url}
              poster={item.media_formats.preview.url}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="search-input-container">
        <input
          className="search-input"
          type="search"
          placeholder="Search GIFs..."
          aria-label="Search GIFs"
          onChange={inputChange}
        />
      </div>
      {itemsGrid(gifboxItems)}
    </>
  )
}

export default App
