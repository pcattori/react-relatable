import React from 'react'

interface ColumnWidth {
  current: number
  min: number
  max: number
}

const getCursor = (columnWidth: ColumnWidth) => {
  if (columnWidth.current === columnWidth.min) {
    return 'e-resize' as const
  }
  if (columnWidth.current === columnWidth.max) {
    return 'w-resize' as const
  }
  return 'col-resize' as const
}

const styles = ({ columnWidth }: { columnWidth: ColumnWidth }) =>
  ({
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    height: '100%',
    width: '10px',
    ':hover': {
      cursor: getCursor(columnWidth),
    },
    '::after': {
      content: '""',
      position: 'absolute',
      margin: 'auto',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      height: 24,
      width: 1.1,
      backgroundColor: 'black',
    },
  } as const)

/**
 * A draggable column resize handle
 *
 * @param props
 * @param props.columnWidth - The current column width in pixels
 * @param props.handleResizeStart - Callback for when a user starts to drag the resize handle.
 */
export const ColumnResizeHandle: React.FC<{
  columnWidth: ColumnWidth
  resize: (width: number) => void
  handleResizeStart: (startX: number) => void
}> = ({ columnWidth, resize, handleResizeStart }) => {
  return (
    <div
      tabIndex={0}
      role="slider"
      aria-valuenow={columnWidth.current}
      aria-valuemin={columnWidth.min}
      aria-valuemax={columnWidth.max}
      css={styles({ columnWidth })}
      onMouseDown={e => {
        e.preventDefault()
        handleResizeStart(e.clientX)
      }}
      onKeyDown={e => {
        if (e.code === 'ArrowRight' || e.code === 'ArrowUp') {
          e.preventDefault()
          resize(columnWidth.current + 1)
        }
        if (e.code === 'PageUp') {
          e.preventDefault()
          resize(columnWidth.current + 10)
        }

        if (e.code === 'ArrowLeft' || e.code === 'ArrowDown') {
          e.preventDefault()
          resize(columnWidth.current - 1)
        }
        if (e.code === 'PageDown') {
          e.preventDefault()
          resize(columnWidth.current - 10)
        }
      }}
    />
  )
}
