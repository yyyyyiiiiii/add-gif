import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import { useState } from 'react'

function App(): React.JSX.Element {
  const [query, setQuery] = useState('');

  window.electron.ipcRenderer.on('search-result', (_event, data) => {
    setQuery(JSON.stringify(data, null, 2));
    // console.log('Search result received:', data);
  });

  window.electron.ipcRenderer.on('search-error', (_event, error) => {
    console.error('Search error received:', error);
  });

  function parseInput(text: string): React.ReactNode {
    if (text.startsWith('**') && text.endsWith('**')) {
      return <strong>{text.slice(2, -2)}</strong>;
    }

    console.log('parseInput called with text:', text);
    return <span>{text}</span>;
  }

  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping');
  const inputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const query = event.target.value;
    window.electron.ipcRenderer.send('search', query);
  };

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
      <input onChange={inputChange}/>
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
