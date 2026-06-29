const AUDIO_MASTER_STORAGE_KEY = 'musicplay.audio-master'
const AUDIO_MASTER_TTL_MS = 8000
const AUDIO_MASTER_HEARTBEAT_MS = 2500

type AudioMasterRecord = {
  clientId: string
  updatedAt: number
}

const createClientId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `client-${Math.random().toString(36).slice(2)}`
}

class PlaybackSession {
  private readonly clientId = createClientId()
  private heartbeatTimer: number | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.release)
    }
  }

  isMaster = () => this.readRecord()?.clientId === this.clientId

  hasActiveMaster = () => {
    const record = this.readRecord()
    return Boolean(record && !this.isExpired(record))
  }

  claimMaster = () => {
    const now = Date.now()
    const current = this.readRecord()

    if (current && !this.isExpired(current) && current.clientId !== this.clientId) {
      return false
    }

    this.writeRecord({
      clientId: this.clientId,
      updatedAt: now,
    })
    this.startHeartbeat()
    return true
  }

  forceClaimMaster = () => {
    this.writeRecord({
      clientId: this.clientId,
      updatedAt: Date.now(),
    })
    this.startHeartbeat()
  }

  release = () => {
    if (!this.isMaster()) {
      this.stopHeartbeat()
      return
    }

    this.stopHeartbeat()
    window.localStorage.removeItem(AUDIO_MASTER_STORAGE_KEY)
  }

  clearGlobalMaster = () => {
    this.stopHeartbeat()
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.removeItem(AUDIO_MASTER_STORAGE_KEY)
  }

  private startHeartbeat() {
    if (this.heartbeatTimer !== null) {
      return
    }

    this.heartbeatTimer = window.setInterval(() => {
      if (!this.isMaster()) {
        this.stopHeartbeat()
        return
      }

      this.writeRecord({
        clientId: this.clientId,
        updatedAt: Date.now(),
      })
    }, AUDIO_MASTER_HEARTBEAT_MS)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer === null) {
      return
    }

    window.clearInterval(this.heartbeatTimer)
    this.heartbeatTimer = null
  }

  private readRecord(): AudioMasterRecord | null {
    if (typeof window === 'undefined') {
      return null
    }

    try {
      const rawValue = window.localStorage.getItem(AUDIO_MASTER_STORAGE_KEY)
      if (!rawValue) {
        return null
      }

      const record = JSON.parse(rawValue) as AudioMasterRecord
      if (this.isExpired(record)) {
        if (record.clientId === this.clientId) {
          this.stopHeartbeat()
        }
        window.localStorage.removeItem(AUDIO_MASTER_STORAGE_KEY)
        return null
      }

      return record
    } catch {
      return null
    }
  }

  private writeRecord(record: AudioMasterRecord) {
    window.localStorage.setItem(AUDIO_MASTER_STORAGE_KEY, JSON.stringify(record))
  }

  private isExpired(record: AudioMasterRecord) {
    return Date.now() - record.updatedAt > AUDIO_MASTER_TTL_MS
  }
}

export const playbackSession = new PlaybackSession()
