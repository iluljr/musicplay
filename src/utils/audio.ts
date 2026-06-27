const writeString = (view: DataView, offset: number, value: string) => {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index))
  }
}

export const createToneAudioUrl = (
  frequency: number,
  durationInSeconds: number,
) => {
  const sampleRate = 44_100
  const totalSamples = Math.floor(sampleRate * durationInSeconds)
  const bytesPerSample = 2
  const dataSize = totalSamples * bytesPerSample
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * bytesPerSample, true)
  view.setUint16(32, bytesPerSample, true)
  view.setUint16(34, 16, true)
  writeString(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  for (let sampleIndex = 0; sampleIndex < totalSamples; sampleIndex += 1) {
    const time = sampleIndex / sampleRate
    const fadeIn = Math.min(time / 0.12, 1)
    const fadeOut = Math.min((durationInSeconds - time) / 0.18, 1)
    const envelope = Math.max(0, Math.min(fadeIn, fadeOut))
    const waveform =
      Math.sin(2 * Math.PI * frequency * time) * 0.35 +
      Math.sin(2 * Math.PI * frequency * 1.5 * time) * 0.08

    view.setInt16(44 + sampleIndex * bytesPerSample, waveform * envelope * 32_767, true)
  }

  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }))
}
