import type { StoredAssetRecord, StoredSongRecord } from '@/types/media'

const DATABASE_NAME = 'musicplay-media-library'
const DATABASE_VERSION = 1
const SONGS_STORE = 'songs'
const ASSETS_STORE = 'assets'

const openDatabase = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

    request.onupgradeneeded = () => {
      const database = request.result

      if (!database.objectStoreNames.contains(SONGS_STORE)) {
        database.createObjectStore(SONGS_STORE, { keyPath: 'id' })
      }

      if (!database.objectStoreNames.contains(ASSETS_STORE)) {
        database.createObjectStore(ASSETS_STORE, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

const runStoreRequest = <T>(request: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

const withTransaction = async <T>(
  storeNames: string[],
  mode: IDBTransactionMode,
  callback: (stores: Record<string, IDBObjectStore>) => Promise<T>,
) => {
  const database = await openDatabase()

  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(storeNames, mode)
    const stores = Object.fromEntries(
      storeNames.map((storeName) => [storeName, transaction.objectStore(storeName)]),
    )

    callback(stores)
      .then((result) => {
        transaction.oncomplete = () => {
          database.close()
          resolve(result)
        }
        transaction.onerror = () => reject(transaction.error)
      })
      .catch((error) => {
        database.close()
        reject(error)
      })
  })
}

export const mediaStorage = {
  async getSongs() {
    return withTransaction([SONGS_STORE], 'readonly', async (stores) => {
      const songs = await runStoreRequest(stores[SONGS_STORE].getAll())
      return songs as StoredSongRecord[]
    })
  },
  async putSongs(songs: StoredSongRecord[]) {
    return withTransaction([SONGS_STORE], 'readwrite', async (stores) => {
      await Promise.all(songs.map((song) => runStoreRequest(stores[SONGS_STORE].put(song))))
    })
  },
  async deleteSongs(songIds: string[]) {
    return withTransaction([SONGS_STORE], 'readwrite', async (stores) => {
      await Promise.all(songIds.map((songId) => runStoreRequest(stores[SONGS_STORE].delete(songId))))
    })
  },
  async getAssets() {
    return withTransaction([ASSETS_STORE], 'readonly', async (stores) => {
      const assets = await runStoreRequest(stores[ASSETS_STORE].getAll())
      return assets as StoredAssetRecord[]
    })
  },
  async putAssets(assets: StoredAssetRecord[]) {
    return withTransaction([ASSETS_STORE], 'readwrite', async (stores) => {
      await Promise.all(assets.map((asset) => runStoreRequest(stores[ASSETS_STORE].put(asset))))
    })
  },
  async deleteAssets(assetIds: string[]) {
    return withTransaction([ASSETS_STORE], 'readwrite', async (stores) => {
      await Promise.all(
        assetIds.map((assetId) => runStoreRequest(stores[ASSETS_STORE].delete(assetId))),
      )
    })
  },
  async clearLibrary() {
    return withTransaction([SONGS_STORE, ASSETS_STORE], 'readwrite', async (stores) => {
      await Promise.all([
        runStoreRequest(stores[SONGS_STORE].clear()),
        runStoreRequest(stores[ASSETS_STORE].clear()),
      ])
    })
  },
}
