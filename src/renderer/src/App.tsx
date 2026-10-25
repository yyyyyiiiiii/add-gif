import { useState } from 'react'
import { GifboxItems } from './gifbox'

function App(): React.JSX.Element {
  const [giftboxItems, setGiftboxItems] = useState<GifboxItems>()

  window.electron.ipcRenderer.on('search-result', (_event, items) => {
    setGiftboxItems(items)
  })

  window.electron.ipcRenderer.on('search-error', (_event, error) => {
    console.error('Search error received:', error)
  })

  const loadMore = (event: React.UIEvent<HTMLDivElement>): void => {
    console.log('called!!')

    const list = event.currentTarget
    const nearBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 200

    console.log(list, nearBottom)
  }

  const itemsGrid = (gifboxItems: GifboxItems | undefined): React.ReactNode => {
    if (gifboxItems === undefined) {
      return <></>
    }

    const items = gifboxItems.results
    return (
      <div className="gif-list-container" onScroll={loadMore}>
        {items.map((item) => {
          return (
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
          )
        })}
      </div>
    )
  }

  const inputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const query = event.target.value
    window.electron.ipcRenderer.send('search', query)
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
      {itemsGrid(giftboxItems)}
    </>
  )
}

// import { useEffect, useState, useRef } from 'react'
// import { GifboxItem, GifboxItems } from './gifbox'

// function App(): React.JSX.Element {
//   const [items, setItems] = useState<GifboxItem[]>([])
//   const [next, setNext] = useState<string | null>(null)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [loading, setLoading] = useState(false)
//   const listRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     const handleResult = (_event: unknown, data: GifboxItems): void => {
//       // A page is appended to the current results.
//       setItems((current) => [...current, ...data.results])
//       setNext(data.next ?? null)
//       setLoading(false)
//     }

//     const handleError = (_event: unknown, error: unknown): void => {
//       console.error('Search error:', error)
//       setLoading(false)
//     }

//     window.electron.ipcRenderer.on('search-result', handleResult)
//     window.electron.ipcRenderer.on('search-error', handleError)

//     return () => {
//       // Use the matching remove method exposed by your preload API.
//       window.electron.ipcRenderer.removeListener?.('search-result', handleResult)
//       window.electron.ipcRenderer.removeListener?.('search-error', handleError)
//     }
//   }, [])

//   const search = (term: string): void => {
//     setSearchTerm(term)
//     setItems([])
//     setNext(null)
//     setLoading(true)

//     // Start a fresh search; omit `next` on the first request.
//     window.electron.ipcRenderer.send('search', { query: term })
//   }

//   const loadMore = (): void => {
//     if (loading || !next || !searchTerm) return

//     setLoading(true)
//     window.electron.ipcRenderer.send('search', {
//       query: searchTerm,
//       next
//     })
//   }

//   const handleScroll = (): void => {
//     const list = listRef.current
//     if (!list) return

//     const nearBottom =
//       list.scrollTop + list.clientHeight >= list.scrollHeight - 200

//     if (nearBottom) loadMore()
//   }

//   return (
//     <>
//       <div className="search-input-container">
//         <input
//           className="search-input"
//           type="search"
//           placeholder="Search GIFs..."
//           aria-label="Search GIFs"
//           onChange={(event) => search(event.target.value)}
//         />
//       </div>

//       <div
//         className="gif-list-container"
//         ref={listRef}
//         onScroll={handleScroll}
//       >
//         {items.map((item) => (
//           <div className="gif-tile" key={item.id}>
//             <video
//               src={item.media_formats.webm.url}
//               poster={item.media_formats.preview.url}
//               autoPlay
//               muted
//               loop
//               playsInline
//               preload="metadata"
//             />
//           </div>
//         ))}

//         {loading && <div className="loading-message">Loading…</div>}
//       </div>
//     </>
//   )
// }

export default App
