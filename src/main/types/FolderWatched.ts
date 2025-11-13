import fs from 'fs'

export type FolderWatched = {
    lastScanned: number
    watchActive: boolean
    promise: fs.FSWatcher | null
}
