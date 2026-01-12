/**
 * Highlights search terms in text
 * @param {string} text - The text to highlight
 * @param {string} searchTerm - The search term to highlight
 * @returns {JSX.Element} - React element with highlighted text
 */
export const highlightText = (text, searchTerm) => {
  if (!searchTerm || !text) return text;

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (regex.test(part)) {
      return (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      );
    }
    return part;
  });
};
