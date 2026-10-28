import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import process from 'node:process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { GifboxItem, GifboxSearch, GifboxMediaFormats } from '../gifbox/gifbox'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

const GIFTBOX_API_KEY: string = process.env.GIFTBOX_API_KEY || ''

const GIFBOX_MEDIA_FORMAT_INFO = {
  loopedmp4: { label: 'MP4 video', ext: 'mp4' },
  mp4: { label: 'MP4 video', ext: 'mp4' },
  tinymp4: { label: 'MP4 video', ext: 'mp4' },
  nanomp4: { label: 'MP4 video', ext: 'mp4' },
  webm: { label: 'WebM video', ext: 'webm' },
  tinywebm: { label: 'WebM video', ext: 'webm' },
  nanowebm: { label: 'WebM video', ext: 'webm' },
  gif: { label: 'GIF image', ext: 'gif' },
  mediumgif: { label: 'GIF image', ext: 'gif' },
  tinygif: { label: 'GIF image', ext: 'gif' },
  nanogif: { label: 'GIF image', ext: 'gif' }
} as const

type GifUrls = {
  mp4?: Array<string>
  webm?: Array<string>
  gif?: Array<string>
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('search', async (event, query: string, next: string | undefined) => {
    try {
      const data = await GifboxSearch({
        key: GIFTBOX_API_KEY,
        q: query,
        ...(next !== undefined ? { pos: next } : {})
      })
      event.reply('search-result', data)
    } catch (error) {
      console.error('Error during search:', error)
      event.reply('search-error', error)
    }
  })

  // TODO: make it less miserable
  ipcMain.on('save', async (event, item: GifboxItem) => {
    try {
      const available = Object.entries(GIFBOX_MEDIA_FORMAT_INFO).flatMap(([key, info]) => {
        const url = item.media_formats?.[key as keyof GifboxMediaFormats]?.url
        return url ? [{ key, url, ...info }] : []
      })

      if (available.length === 0) {
        event.reply('save-error', 'No downloadable formats available')
        return
      }

      const urls: GifUrls = available.reduce((acc, cur) => {
        if (acc?.[cur.ext] !== undefined) acc[cur.ext].push(cur.url)
        else acc[cur.ext] = [cur.url]
        return acc
      }, {})

      const { canceled, filePath } = await dialog.showSaveDialog({
        defaultPath: item.title + '.gif' || 'media'
      })

      if (canceled || !filePath) return

      const ext = path.extname(filePath).replace('.', '')

      if (!urls[ext])
        throw new Error(
          `No downloadable extension available: ${ext},
available: ${String(Object.keys(urls))}`
        )

      const item_url = urls[ext][0]
      const response = await fetch(item_url)
      if (!response.ok) throw new Error(`Download failed: ${response.status}`)

      const bytes = await response.arrayBuffer()

      await fs.writeFile(filePath, Buffer.from(bytes))
      event.reply('save-result', 'good')
    } catch (error) {
      console.error('Error saving media:', error)
      event.reply('save-error', error instanceof Error ? error.message : String(error))
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
