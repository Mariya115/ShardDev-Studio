import { useRef, useEffect, useState } from 'react'

export function SolidityEditor({ value, onChange, disabled = false }) {
  const textareaRef = useRef(null)
  const [lineCount, setLineCount] = useState(1)

  useEffect(() => {
    setLineCount(value.split('\n').length)
  }, [value])

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = value.substring(0, start) + '\t' + value.substring(end)
      onChange(newValue)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1
      }, 0)
    }
  }

  const handleScroll = (e) => {
    const lineNumbers = document.getElementById('line-numbers')
    if (lineNumbers) {
      lineNumbers.scrollTop = e.target.scrollTop
    }
  }

  return (
    <div className="h-full w-full flex flex-col bg-zinc-950/50 border border-border-subtle rounded-lg overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Line Numbers */}
        <div
          id="line-numbers"
          className="bg-zinc-900/80 border-r border-border-subtle px-2 py-4 text-right text-xs font-mono text-zinc-600 select-none overflow-hidden"
          style={{
            width: '3.5rem',
            lineHeight: '1.65',
            fontFamily: 'Menlo, Monaco, Courier New, monospace',
            fontSize: '13px',
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1}>{i + 1}</div>
          ))}
        </div>

        {/* Code Editor */}
        <div className="relative flex-1 overflow-hidden">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            disabled={disabled}
            spellCheck="false"
            className="absolute inset-0 w-full h-full resize-none border-0 bg-transparent p-4 font-mono text-[13px] leading-[1.65] text-zinc-100 caret-accent outline-none transition-opacity placeholder:text-zinc-700 disabled:opacity-75 disabled:cursor-wait overflow-hidden"
            style={{
              fontFamily: 'Menlo, Monaco, Courier New, monospace',
              lineHeight: '1.65',
              background: 'transparent',
              color: '#f5f5f5',
              caretColor: '#06b6d4',
              zIndex: 2,
              resize: 'none',
              paddingLeft: '1rem',
              paddingRight: '1rem',
            }}
            placeholder="// SPDX-License-Identifier: MIT&#10;pragma solidity ^0.8.20;&#10;&#10;contract MyContract { }"
            aria-label="Solidity source code"
          />

          {/* Syntax Highlighting Background */}
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden text-zinc-400"
            style={{
              fontFamily: 'Menlo, Monaco, Courier New, monospace',
              fontSize: '13px',
              lineHeight: '1.65',
              padding: '1rem',
              paddingLeft: '1rem',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              color: '#a1a1a1',
              zIndex: 1,
            }}
          >
            {value}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t border-border-subtle bg-zinc-900/50 px-4 py-2 text-xs text-zinc-500 flex items-center justify-between">
        <div className="flex gap-4">
          <span>{lineCount} lines</span>
          <span>{value.length} characters</span>
        </div>
        <div>UTF-8</div>
      </div>
    </div>
  )
}

