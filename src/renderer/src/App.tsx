import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import { useState } from 'react'

function App(): React.JSX.Element {
  const [query, setQuery] = useState('')

  window.electron.ipcRenderer.on('search-result', (_event, data) => {
    setQuery(JSON.stringify(data, null, 2))
    // console.log('Search result received:', data);
  })

  window.electron.ipcRenderer.on('search-error', (_event, error) => {
    console.error('Search error received:', error)
  })

  function parseInput(text: string): React.ReactNode {
    console.log(text)
    if (text === undefined || text === '') {
      return <span>Enter a search query to see results.</span>
    }

    const items = JSON.parse(text)?.results
    if (!items || !Array.isArray(items)) {
      return <span>{text}</span>
    }
    console.log(items)
    return (
      <div className="gif-list-container">
        {items.map((item) => {
          return (
            <div key={item.id}>
              <video
                src={item.media_formats.webm.url}
                poster={item.media_formats.preview.url}
                autoPlay
                muted
                loop
                playsInline
                width="200"
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

  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  const inputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const query = event.target.value
    window.electron.ipcRenderer.send('search', query)
  }

  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <input onChange={inputChange} />
      <div>{parseInput(query)}</div>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div>
      </div>
      <Versions></Versions>
    </>
  )
}

export default App
