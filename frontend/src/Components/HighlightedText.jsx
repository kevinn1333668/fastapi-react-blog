import { splitTextByQuery } from "../utils/postSearch";

export default function HighlightedText({ text, query }) {
  const segments = splitTextByQuery(text, query);

  return (
    <>
      {segments.map((part, index) =>
        part.match ? (
          <mark
            key={index}
            className="rounded-sm bg-yellow-200/90 px-0.5 text-gray-800"
          >
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
}
