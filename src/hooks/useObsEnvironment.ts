import { useEffect } from 'react'

type UseObsEnvironmentOptions = {
  transparentBackground: boolean
}

export const useObsEnvironment = ({
  transparentBackground,
}: UseObsEnvironmentOptions) => {
  useEffect(() => {
    const root = document.documentElement
    const body = document.body

    if (transparentBackground) {
      root.dataset.obsMode = 'true'
      body.dataset.obsMode = 'true'
      root.dataset.obsTransparent = 'true'
      body.dataset.obsTransparent = 'true'
    } else {
      delete root.dataset.obsMode
      delete body.dataset.obsMode
      delete root.dataset.obsTransparent
      delete body.dataset.obsTransparent
    }

    return () => {
      delete root.dataset.obsMode
      delete body.dataset.obsMode
      delete root.dataset.obsTransparent
      delete body.dataset.obsTransparent
    }
  }, [transparentBackground])
}
