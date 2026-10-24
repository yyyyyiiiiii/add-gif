import { useState } from 'react'

function App(): React.JSX.Element {
  const [query, setQuery] = useState('')

  window.electron.ipcRenderer.on('search-result', (_event, data) => {
    setQuery(JSON.stringify(data, null, 2))
  })

  window.electron.ipcRenderer.on('search-error', (_event, error) => {
    console.error('Search error received:', error)
  })

  function parseInput(text: string): React.ReactNode {
    if (text === undefined || text === '') {
      return <></>
    }

    const items = JSON.parse(text)?.results
    if (!items || !Array.isArray(items)) {
      return <span>{text}</span>
    }

    return (
      <div className="gif-list-container">
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
                preload="auto"
                onError={(e) => {
                  const video = e.currentTarget
                  console.log('Video error:', video.error)
                  console.log('Network state:', video.networkState)
                  console.log('Ready state:', video.readyState)
                }}
                onLoadedMetadata={() => console.log('Video metadata loaded')}
                onCanPlay={() => console.log('Video can play')}
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
      <div>{parseInput(query)}</div>
    </>
  )
}

export default App
