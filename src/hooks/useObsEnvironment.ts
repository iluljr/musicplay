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
      root.dataset.obsTransparent = 'true'
      body.dataset.obsTransparent = 'true'
    } else {
      delete root.dataset.obsTransparent
      delete body.dataset.obsTransparent
    }

    return () => {
      delete root.dataset.obsTransparent
      delete body.dataset.obsTransparent
    }
  }, [transparentBackground])
}
