export type AppTheme = 'midnight' | 'obsidian' | 'graphite'
export type LyricsAnimation = 'cinematic' | 'smooth' | 'minimal'
export type VisualizerStyle = 'ambient' | 'bars' | 'wave'

export type AppSettings = {
  theme: AppTheme
  accentColor: string
  obsMode: boolean
  autoPlay: boolean
  loop: boolean
  shuffle: boolean
  lyricsSize: number
  lyricsAnimation: LyricsAnimation
  crossfadeDuration: number
  volume: number
  visualizerStyle: VisualizerStyle
  obsMinimal: boolean
  obsShowCover: boolean
  obsShowControls: boolean
  obsShowPlaylist: boolean
  obsShowProgress: boolean
  obsShowLyrics: boolean
}
