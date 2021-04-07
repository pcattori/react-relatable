import type React from 'react'

import { useObtrusiveScrollbarWidths } from './useObtrusiveScrollbarWidths'
import { useScrollSync } from './useScrollSync'

interface Args {
  trHead: React.MutableRefObject<HTMLElement | null>
  tbody: React.MutableRefObject<HTMLElement | null>
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useTableLayout = ({ trHead, tbody }: Args) => {
  useScrollSync([trHead, tbody], { proportional: false, axis: 'horizontal' })
  const obtrusive = useObtrusiveScrollbarWidths(tbody)
  return {
    table: {
      boxSizing: 'border-box',
      borderCollapse: 'collapse',
      textIndent: 0,
      borderColor: 'inherit',
      overflow: 'hidden',
      display: 'grid',
      gridTemplateRows: 'auto 1fr',
    },
    thead: {
      boxSizing: 'border-box',
      overflow: 'hidden',
    },
    trHead: {
      boxSizing: 'border-box',
      overflowX: 'auto',
      overflowY: 'hidden',

      /*
      Hide horizontal scrollbar for thead row.
      See https://www.w3schools.com/howto/howto_css_hide_scrollbars.asp
      */
      // Firefox
      scrollbarWidth: 'none',
      // Edge, IE
      msOverflowStyle: 'none',
      // Chrome, Safari
      '::-webkit-scrollbar': {
        display: 'none',
      },

      display: 'flex',
    },
    tbody: {
      boxSizing: 'border-box',
      overflow: 'auto',
    },
    trBody: {
      boxSizing: 'border-box',
      minWidth: 'max-content',
      display: 'flex',
    },
    th: {
      boxSizing: 'border-box',
      flex: 'none',
    },
    thFill: {
      boxSizing: 'border-box',
      minWidth: obtrusive.x,
      flexGrow: 1,
      padding: 0,
    },
    td: {
      boxSizing: 'border-box',
      flex: 'none',
    },
    tdFill: {
      boxSizing: 'border-box',
      flexGrow: 1,
      padding: 0,
    },
  } as const
}
