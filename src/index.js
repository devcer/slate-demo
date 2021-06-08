import React, { useState, useMemo, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { createEditor, Editor, Transforms , Text} from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { withHistory } from 'slate-history'

// Define a React component renderer for our code blocks.
const CodeElement = (props) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  )
}

const QuestionElement = (props) => {
  return (
    <p {...props.attributes}>
      <span>/</span>
      {props.children}
    </p>
  )
}

const DefaultElement = (props) => {
  return <p {...props.attributes}>{props.children}</p>
}

// Define a React component to render leaves with bold text.
const Leaf = (props) => {
  return (
    <span
      {...props.attributes}
      style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal', color: props.leaf.question? 'pink': 'black' }}
    >
      {props.leaf.question && <span>/</span>}
      {props.children}
    </span>
  )
}
// Define our own custom set of helpers.
const CustomEditor = {
  isBoldMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.bold === true,
      universal: true,
    })

    return !!match
  },
  isQuestionMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.question === true,
      universal: true,
    })

    return !!match
  },

  isCodeBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.type === 'code',
    })

    return !!match
  },

  toggleBoldMark(editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor)
    Transforms.setNodes(
      editor,
      { bold: isActive ? null : true },
      { match: n => Text.isText(n), split: true }
    )
  },
  toggleQuestionMark(editor) {
    const isActive = CustomEditor.isQuestionMarkActive(editor)
    Transforms.setNodes(
      editor,
      { question: isActive ? null : true },
      { match: n => Text.isText(n) }
    )
  },

  toggleCodeBlock(editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor)
    Transforms.setNodes(
      editor,
      { type: isActive ? null : 'code' },
      { match: n => Editor.isBlock(editor, n) }
    )
  },
}

const App = () => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  const [value, setValue] = useState([
    {
      type: 'section',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              text: 'Sample text'
            }
          ]
        }
      ]
    }
  ])
  // Define a rendering function based on the element passed to `props`. We use
  // `useCallback` here to memoize the function for subsequent renders.
  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />
      case 'question': 
        return <QuestionElement {...props} />
      default:
        return <DefaultElement {...props} />
    }
  }, [])

  // Define a leaf rendering function that is memoized with `useCallback`.
  const renderLeaf = useCallback((props) => {
    return <Leaf {...props} />
  }, [])

  return (
    <>
      <Slate
        editor={editor}
        value={value}
        onChange={(value) => setValue(value)}
      >
      <div>
        <button
          onMouseDown={event => {
            event.preventDefault()
            CustomEditor.toggleBoldMark(editor)
          }}
        >
          Bold
        </button>
        <button
          onMouseDown={event => {
            event.preventDefault()
            CustomEditor.toggleQuestionMark(editor)
          }}
        >
          Question
        </button>
        <button
          onMouseDown={event => {
            event.preventDefault()
            CustomEditor.toggleCodeBlock(editor)
          }}
        >
          Code Block
        </button>
      </div>
        <Editable
          // Pass in the `renderElement` function.
          renderElement={renderElement}
          // Pass in the `renderLeaf` function.
          renderLeaf={renderLeaf}
          onKeyDown={(event) => {
            if (!event.ctrlKey)  {
              return
            }

            switch (event.key) {
              // When "`" is pressed, keep our existing code block logic.
              case '`': {
                event.preventDefault()
                CustomEditor.toggleCodeBlock(editor)
                break
              }

              // When "B" is pressed, bold the text in the selection.
              case 'b': {
                event.preventDefault()
                CustomEditor.toggleBoldMark(editor)
                break
              }

              // When "B" is pressed, bold the text in the selection.
              case '/': {
                event.preventDefault()
                CustomEditor.toggleBoldMark(editor)
                break
              }
              default:
                break
            }
          }}
        />
      </Slate>
      <button
        onClick={() =>
          setValue([
            {
              type: 'section',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Sample text'
                    }
                  ]
                }
              ]
            }
          ])
        }
      >
        Reset
      </button>
    </>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
