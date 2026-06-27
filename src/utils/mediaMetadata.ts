export const getAudioDurationFromFile = async (file: File) => {
  const objectUrl = URL.createObjectURL(file)

  try {
    const duration = await new Promise<number>((resolve) => {
      const audio = new Audio()

      audio.preload = 'metadata'
      audio.onloadedmetadata = () => resolve(Number.isFinite(audio.duration) ? audio.duration : 0)
      audio.onerror = () => resolve(0)
      audio.src = objectUrl
    })

    return duration
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
