import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
//import "prismjs/components/prism-glsl"; // optional; remove if you don't want it

export default function CodeEditorField({
  value,
  onChange,
  language = "javascript",
  placeholder = "// code...",
}) {
  const highlight = (code) =>
    Prism.highlight(code, Prism.languages[language] || Prism.languages.javascript, language);

  return (
    <div className="ce-wrap">
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={highlight}
        padding={10}
        textareaId={`ce-${language}`}
        textareaClassName="ce-textarea"
        preClassName={`language-${language} ce-pre`}
        placeholder={placeholder}
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 12,
          lineHeight: 1.5,
          overflowY: 'auto', 
        }}
      />
    </div>
  );
}