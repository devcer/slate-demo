import React, { useState, useMemo, useCallback } from "react";
import ReactDOM from "react-dom";
import {
  createEditor,
  Editor,
  Transforms,
  Text,
  Element as SlateElement
} from "slate";
import { Slate, Editable, withReact } from "slate-react";
import "./styles.css";
// import { withHistory } from "slate-history";
const LIST_TYPES = ["numbered-list", "bulleted-list"];
// Define a React component renderer for our code blocks.
const CodeElement = (props) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
};

// Define a React component renderer for our code blocks.
const SectionElement = (props) => {
  return <span {...props.attributes}>------------------{props.children}</span>;
};

const QuestionElement = (props) => {
  return (
    <p {...props.attributes} style={{ color: "red" }}>
      <span>/</span>
      {props.children}
    </p>
  );
};

const DefaultElement = (props) => {
  return <p {...props.attributes}>{props.children}</p>;
};

// Define our own custom set of helpers.
const CustomEditor = {
  isBoldMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.bold === true,
      universal: true
    });

    return !!match;
  },
  isItalicMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.italic === true,
      universal: true
    });

    return !!match;
  },
  isUnderlineMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.underline === true,
      universal: true
    });

    return !!match;
  },
  isQuestionMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.question === true,
      universal: true
    });

    return !!match;
  },

  isCodeBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === "code"
    });

    return !!match;
  },
  isHeadingBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === "heading"
    });

    return !!match;
  },
  isQuestionBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === "question"
    });

    return !!match;
  },
  isListBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === "list-item"
    });

    return !!match;
  },

  isSectionBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === "section"
    });

    return !!match;
  },

  toggleBoldMark(editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);
    Transforms.setNodes(
      editor,
      { bold: isActive ? null : true },
      { match: (n) => Text.isText(n), split: true }
    );
  },
  toggleItalicMark(editor) {
    const isActive = CustomEditor.isItalicMarkActive(editor);
    Transforms.setNodes(
      editor,
      { italic: isActive ? null : true },
      { match: (n) => Text.isText(n), split: true }
    );
  },
  toggleUnderlineMark(editor) {
    const isActive = CustomEditor.isUnderlineMarkActive(editor);
    Transforms.setNodes(
      editor,
      { underline: isActive ? null : true },
      { match: (n) => Text.isText(n), split: true }
    );
  },
  toggleQuestionMark(editor) {
    const isActive = CustomEditor.isQuestionMarkActive(editor);
    Transforms.setNodes(
      editor,
      { question: isActive ? null : true },
      { match: (n) => Text.isText(n) }
    );
  },

  toggleCodeBlock(editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor);
    Transforms.setNodes(
      editor,
      { type: isActive ? null : "code" },
      { match: (n) => Editor.isBlock(editor, n) }
    );
  },
  toggleHeadingBlock(editor) {
    const isActive = CustomEditor.isHeadingBlockActive(editor);
    Transforms.setNodes(
      editor,
      { type: isActive ? null : "heading" },
      { match: (n) => Editor.isBlock(editor, n) }
    );
  },
  toggleQuestionBlock(editor) {
    const isActive = CustomEditor.isQuestionBlockActive(editor);
    Transforms.setNodes(
      editor,
      { type: isActive ? null : "question" },
      { match: (n) => Editor.isBlock(editor, n) }
    );
  },
  toggleListBlock(editor, format) {
    const isActive = CustomEditor.isListBlockActive(editor);
    const isList = true;

    Transforms.unwrapNodes(editor, {
      match: (n) =>
        LIST_TYPES.includes(
          !Editor.isEditor(n) && SlateElement.isElement(n) && n.type
        ),
      split: true
    });
    const newProperties = {
      type: isActive ? "paragraph" : isList ? "list-item" : format
    };
    Transforms.setNodes(editor, newProperties);

    if (!isActive) {
      const block = { type: format, children: [] };
      Transforms.wrapNodes(editor, block);
    }
  },

  toggleSectionBlock(editor) {
    const isActive = CustomEditor.isSectionBlockActive(editor);
    Transforms.setNodes(
      editor,
      { type: isActive ? null : "section" },
      { match: (n) => Editor.isBlock(editor, n) }
    );
  }
};

const App = () => {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState([
    {
      type: "paragraph",
      children: [{ text: "A line of text in a paragraph." }]
    }
  ]);

  const renderElement = useCallback(({ attributes, children, element }) => {
    switch (element.type) {
      case "block-quote":
        return <blockquote {...attributes}>{children}</blockquote>;
      case "bulleted-list":
        return <ul {...attributes}>{children}</ul>;
      case "heading-one":
        return <h1 {...attributes}>{children}</h1>;
      case "heading-two":
        return <h2 {...attributes}>{children}</h2>;
      case "list-item":
        return <li {...attributes}>{children}</li>;
      case "numbered-list":
        return <ol {...attributes}>{children}</ol>;
      case "question":
        return (
          <p {...attributes} style={{ color: "#f9005e" }}>
            <span>/</span>
            {children}
          </p>
        );
      case "code":
        return (
          <pre {...attributes}>
            <code>{children}</code>
          </pre>
        );
      case "heading":
        return <h1 {...attributes}>{children}</h1>;
      default:
        return <p {...attributes}>{children}</p>;
    }
  }, []);

  const renderLeaf = useCallback((props) => {
    return <Leaf {...props} />;
  }, []);

  return (
    // Add a toolbar with buttons that call the same methods.
    <Slate editor={editor} value={value} onChange={(value) => setValue(value)}>
      <div>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleBoldMark(editor);
          }}
        >
          Bold
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleItalicMark(editor);
          }}
        >
          Italic
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleUnderlineMark(editor);
          }}
        >
          Underline
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleListBlock(editor, "bulleted-list");
          }}
        >
          List
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleListBlock(editor, "numbered-list");
          }}
        >
          Numbered List
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleHeadingBlock(editor);
          }}
        >
          Heading
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleQuestionBlock(editor);
          }}
        >
          Question Block
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleCodeBlock(editor);
          }}
        >
          Code Block
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleSectionBlock(editor);
          }}
        >
          Section
        </button>
        <button
          onMouseDown={(event) => {
            console.log(value);
          }}
        >
          Print JSON
        </button>
      </div>
      <Editable
        editor={editor}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={(event) => {
          if (!event.ctrlKey) {
            return;
          }

          switch (event.key) {
            case "`": {
              event.preventDefault();
              CustomEditor.toggleCodeBlock(editor);
              break;
            }

            case "b": {
              event.preventDefault();
              CustomEditor.toggleBoldMark(editor);
              break;
            }

            case "/": {
              event.preventDefault();
              CustomEditor.toggleQuestionBlock(editor);
              break;
            }
            default:
              break;
          }
        }}
      />
    </Slate>
  );
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
