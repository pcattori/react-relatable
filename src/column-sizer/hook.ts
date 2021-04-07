import { useReducer } from 'react'
import useDeepCompareEffect from 'use-deep-compare-effect'

import * as persist from './persist'

// TODO : parameterized types by provided column keys
// TODO : options for defaults for column configs?

const clamp = (x: number, min: number, max: number) =>
  Math.max(Math.min(x, max), min)

const getWidths = (
  configs: Record<string, ColumnSizeConfig>,
  savedWidths: Record<string, number>,
) => {
  return Object.fromEntries(
    Object.entries(configs).map(([key, config]) => {
      if (!config.resizable) {
        return [key, config.initialWidth]
      }
      const savedWidth = savedWidths[key]
      if (savedWidth === undefined) {
        return [key, config.initialWidth]
      }
      const savedWidthIsValid =
        config.minWidth <= savedWidth && savedWidth <= config.maxWidth
      return [key, savedWidthIsValid ? savedWidth : config.initialWidth]
    }),
  )
}

// ------
// Config
// ------

export type ColumnSizeInput =
  | {
      key: string
      initialWidth?: number
      resizable: false
    }
  | {
      key: string
      initialWidth?: number
      resizable?: true
      minWidth?: number
      maxWidth?: number
    }

export type ColumnSizeConfig =
  | {
      initialWidth: number
      resizable: false
    }
  | {
      initialWidth: number
      resizable: true
      minWidth: number
      maxWidth: number
    }

const inputToConfig = (input: ColumnSizeInput): ColumnSizeConfig => {
  let initialWidth = input.initialWidth ?? 128
  if (input.resizable === false) {
    return {
      initialWidth,
      resizable: false,
    }
  }
  const minWidth = input.minWidth ?? 48
  const maxWidth = input.maxWidth ?? Number.MAX_SAFE_INTEGER
  initialWidth = clamp(initialWidth, minWidth, maxWidth)
  return {
    initialWidth,
    resizable: true,
    minWidth,
    maxWidth,
  }
}

// -------
// Reducer
// -------

type State = {
  configs: Record<string, ColumnSizeConfig>
  widths: Record<string, number>
  resizing?: {
    key: string
    startX: number
    startWidth: number
  }
}

type Action =
  | { type: 'reset'; state: State }
  | { type: 'resize-start'; key: string; x: number }
  | { type: 'resize-during'; x: number }
  | { type: 'resize-stop' }
  | { type: 'resize'; key: string; width: number }

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'reset': {
      return action.state
    }
    case 'resize': {
      const config = state.configs[action.key]
      if (!config.resizable) {
        return state
      }

      const width = clamp(action.width, config.minWidth, config.maxWidth)
      return {
        ...state,
        widths: {
          ...state.widths,
          [action.key]: width,
        },
      }
    }
    case 'resize-start': {
      if (!state.configs[action.key].resizable) {
        return state
      }
      return {
        ...state,
        resizing: {
          key: action.key,
          startX: action.x,
          startWidth: state.widths[action.key],
        },
      }
    }
    case 'resize-during': {
      if (state.resizing === undefined) {
        return state
      }
      const config = state.configs[state.resizing.key]
      if (!config.resizable) {
        return state
      }

      const width = clamp(
        state.resizing.startWidth + (action.x - state.resizing.startX),
        config.minWidth,
        config.maxWidth,
      )

      return {
        ...state,
        widths: {
          ...state.widths,
          [state.resizing.key]: width,
        },
      }
    }
    case 'resize-stop': {
      return {
        ...state,
        resizing: undefined,
      }
    }
  }
}

// ----
// Hook
// ----

/**
 * A map from column key to the column resizing metadata for that column.
 * The metadata includes:
 * - `config` : The parsed configuration for the column including:
 *    - `initialWidth` : The initial width upon first render for this column.
 *    - `resizable` : Whether or not this column is resizable.
 *    - `minWidth` : The mininum allowed width for this column if `resizable` is `true`.
 *    - `maxWidth` : The maximumum allowed width for this column if `resizable` is `true`.
 * - `width` : The current calculated width for the column.
 * - `resizeStart` : The "resizing started" handler, typically bound to `onMouseDown`.
 */
export type ColumnSizer = {
  configs: Record<string, ColumnSizeConfig>
  widths: Record<string, number>
  handleResizeStart: (key: string) => (startX: number) => void
  resize: (key: string) => (width: number) => void
}

interface Options {
  localStorageKey?: string
}

/**
 * Column resizing hook
 *
 * This hook calculates and (optionally) persists widths for table columns.
 *
 * @param columns
 * @param columns[].key - The unique key for accessing metadata for this column.
 * @param [columns[].initialWidth=128] - The initial width for this column when it is first rendered.
 * @param [columns[].resizable=true] - Whether or not this column should be resizable.
 * @param [columns[].minWidth=48] - Minimum allowed width for this column. If specified, `resizable` must not be `false`.
 * @param [columns[].maxWidth=Number.MAX_SAFE_INTEGER] - Maximum allowed width for this column. If specified, `resizable` must not be `false`.
 *
 * @param options
 * @param [options.localStorageKey] - If present, this key will be used to store the column widths in localstorage.
 *
 * @returns Resizing information for each specified column.
 */
export const useColumnSizer = (
  columns: ColumnSizeInput[],
  { localStorageKey }: Options = {},
): ColumnSizer => {
  const configs = Object.fromEntries(
    columns.map(col => [col.key, inputToConfig(col)]),
  )

  const savedWidths = localStorageKey
    ? persist.readOrElse<Record<string, number>>(localStorageKey, {})
    : {}
  const widths = getWidths(configs, savedWidths)

  const initialState = { configs, widths }
  const [state, dispatch] = useReducer(reducer, initialState)

  // synchronize widths to localstorage
  useDeepCompareEffect(() => {
    if (!localStorageKey) {
      return
    }
    persist.write(localStorageKey, state.widths)
  }, [state.widths])

  // synchronize mouse cursor appearance
  useDeepCompareEffect(() => {
    if (state.resizing === undefined) {
      // restore cursor
      document.body.style.cursor = 'default'
      return
    }

    const { key } = state.resizing
    const config = state.configs[key]
    if (!config.resizable) {
      return
    }

    // contextual cursor
    const width = state.widths[key]
    if (width === config.minWidth) {
      document.body.style.cursor = 'e-resize'
    } else if (width === config.maxWidth) {
      document.body.style.cursor = 'w-resize'
    } else {
      document.body.style.cursor = 'col-resize'
    }
  }, [state.resizing, state.widths])

  // synchronize state with configs
  useDeepCompareEffect(() => {
    dispatch({ type: 'reset', state: initialState })
  }, [configs])

  const handleResizeStart = (key: string) => (x: number) => {
    const moveHandler = (e: MouseEvent) =>
      dispatch({ type: 'resize-during', x: e.clientX })

    const upHandler = () => {
      document.removeEventListener('mousemove', moveHandler)
      document.removeEventListener('mouseup', upHandler)
      dispatch({ type: 'resize-stop' })
    }

    document.addEventListener('mousemove', moveHandler)
    document.addEventListener('mouseup', upHandler)

    dispatch({ type: 'resize-start', key, x })
  }

  return {
    configs: state.configs,
    widths: state.widths,
    handleResizeStart,
    resize: (key: string) => (width: number) =>
      dispatch({ type: 'resize', key, width }),
  }
}
