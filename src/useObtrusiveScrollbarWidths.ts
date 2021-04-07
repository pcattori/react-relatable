import type React from 'react'
import { useEffect, useState } from 'react'

import createDetectElementResize from './detectElementResize'

type State = {
  x: number
  y: number
}

const measureObstrusive = (element: HTMLElement): State => {
  // TODO handle fractional widths via `getBoudingClientRect`
  // - https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements
  // TODO account for `box-sizing: context-box` by adjusting for border width via `getComputedStyle`
  const { offsetWidth, offsetHeight, clientWidth, clientHeight } = element
  const obtrusiveX = offsetWidth - clientWidth
  const obtrusiveY = offsetHeight - clientHeight
  return { x: obtrusiveX, y: obtrusiveY }
}

/**
 * Calculates the width (i.e. thickness) of the horizontal (x) and vertical (y)
 * scrollbars for the given HTML element. Widths are only calculated for obtrusive scrollbars
 * (as defined in as defined in
 * [Two Browsers Walked Into a Scrollbar](https://www.filamentgroup.com/lab/scrollbars/)).
 * Unobtrusive scrollbars will have a reported width of `0`.
 *
 * @param ref - HTML element containing potentially scrollable content
 * @returns Object whose properties (`x` and `y`) correspond to the widths
 * of the horizontal and vertical scrollbars. Value will be `0` if
 * scrollbar is unobtrusive or if scrollbar is not currently present.
 */
export const useObtrusiveScrollbarWidths = (
  ref: React.MutableRefObject<HTMLElement | null>,
): State => {
  const [state, setState] = useState<State>({ x: 0, y: 0 })
  const updateState = (newState: State) => {
    setState(state => {
      if (newState.x === state.x && newState.y === state.y) {
        return state
      }
      return newState
    })
  }

  // sync with target ref
  useEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }
    updateState(measureObstrusive(element))
  }, [
    ref.current,
    ref.current?.offsetWidth,
    ref.current?.offsetHeight,
    ref.current?.clientWidth,
    ref.current?.clientHeight,
  ])

  // sync with target element dimensions
  useEffect(() => {
    const {
      addResizeListener,
      removeResizeListener,
    } = createDetectElementResize()
    const element = ref.current
    if (!element) {
      return
    }
    const onResize = () => updateState(measureObstrusive(element))
    addResizeListener(element, onResize)
    return () => removeResizeListener(element, onResize)
  }, [ref.current])

  // sync with content
  useEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }
    const observer = new MutationObserver(() =>
      updateState(measureObstrusive(element)),
    )
    observer.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
    })
    return () => observer.disconnect()
  })
  return state
}
