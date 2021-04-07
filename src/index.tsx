import './tailwind-preflight.css'

import React, { useRef } from 'react'
import ReactDOM from 'react-dom'

import { ColumnResizeHandle } from './column-sizer/handle'
import type { ColumnSizeInput } from './column-sizer/hook'
import { useColumnSizer } from './column-sizer/hook'
import { useTableLayout } from './useTableLayout'

const ellipsis = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} as const

const App: React.FC = () => {
  // testbench
  const [count, setCount] = React.useState(0)

  // layout
  const trHeadRef = useRef<HTMLTableRowElement>(null)
  const tbodyRef = useRef<HTMLTableSectionElement>(null)
  const layout = useTableLayout({ trHead: trHeadRef, tbody: tbodyRef })

  // column sizer
  const { widths, configs, handleResizeStart, resize } = useColumnSizer(
    columns,
    {
      localStorageKey: 'react-relatable/table/column-widths',
    },
  )

  return (
    <article
      css={{ height: '100vh', backgroundColor: 'lightblue', padding: 32 }}
    >
      <button onClick={() => setCount(count => count + 1)}>{count}</button>
      <div
        css={{
          height: '50%',
          width: '100%',
          backgroundColor: 'white',
          border: '1px solid black',
          borderRadius: '5px',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateRows: '1fr auto',
        }}
      >
        <table css={layout.table}>
          <thead css={layout.thead}>
            <tr
              ref={trHeadRef}
              css={{
                ...layout.trHead,
                height: 56,
                borderBottom: '1px solid black',
              }}
            >
              {columns.map(col => {
                const config = configs[col.key]
                return (
                  <th
                    key={col.key}
                    css={{
                      ...layout.th,
                      position: 'relative',
                      width: widths[col.key],
                      padding: '0 8px',
                      display: 'grid',
                      alignItems: 'center',

                      // override default th styles
                      textAlign: 'unset',
                      fontWeight: 'unset',
                    }}
                  >
                    <p css={ellipsis}>{col.name}</p>
                    {config.resizable ? (
                      <ColumnResizeHandle
                        columnWidth={{
                          current: widths[col.key],
                          min: config.minWidth,
                          max: config.maxWidth,
                        }}
                        resize={resize(col.key)}
                        handleResizeStart={handleResizeStart(col.key)}
                      />
                    ) : null}
                  </th>
                )
              })}
              <th css={layout.thFill} />
            </tr>
          </thead>
          <tbody ref={tbodyRef} css={layout.tbody}>
            {rows.map(row => (
              <tr
                key={row.a}
                css={{
                  ...layout.trBody,
                  height: 36,
                  borderBottom: '1px solid black',
                  ':hover': {
                    backgroundColor: 'lightcoral',
                  },
                }}
              >
                {columns.map(col => (
                  <td
                    key={col.key}
                    css={{
                      ...layout.td,
                      width: widths[col.key],
                      padding: '0 8px',
                    }}
                  >
                    <p css={ellipsis}>{row[col.key]}</p>
                  </td>
                ))}
                <td css={layout.tdFill} />
              </tr>
            ))}
          </tbody>
        </table>
        <div>footer</div>
      </div>
    </article>
  )
}

type Column = {
  key: string
  name: string
} & ColumnSizeInput

const columns: Column[] = [
  {
    key: 'a',
    name: 'A is for Alexander',
    initialWidth: 64,
    maxWidth: 200,
  },
  {
    key: 'b',
    name: 'B is for Brian',
    initialWidth: 164,
  },
  {
    key: 'c',
    name: 'C is for Claude "Money" Monet',
    initialWidth: 64,
  },
  {
    key: 'd',
    name: 'D is for Derek Kita',
    initialWidth: 264,
  },
  {
    key: 'e',
    name: 'E is for Evan Puhua Wang',
    initialWidth: 64,
  },
  {
    key: 'f',
    name: 'F is for Franz Ferdinand',
    initialWidth: 64,
  },
  {
    key: 'g',
    name: 'G is for Gilbert Godfrey',
    initialWidth: 64,
  },
  {
    key: 'h',
    name: 'H is for Howard Hughes',
    initialWidth: 64,
  },
]

const generateRow = (rowIndex: number) =>
  Object.fromEntries(
    columns.map((col, columnIndex) => [col.key, rowIndex * 8 + columnIndex]),
  )

const rows = Array(100)
  .fill(null)
  .map((_, i) => generateRow(i))

ReactDOM.render(<App />, document.getElementById('root'))
