import React from 'react';

const DocumentationViewer = ({ documentation }) => {
  if (!documentation) {
    return (
      <div className="text-gray-400 py-6 text-center text-sm">
        No documentation available for this tool.
      </div>
    );
  }

  // Simple Markdown parser for display
  const parseDocumentation = (text) => {
    const lines = text.split('\n');
    const elements = [];
    let inList = false;
    let listItems = [];
    let inCode = false;
    let codeBlock = [];

    const flushList = (key) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${key}`} className="list-disc pl-5 mb-4 space-y-1.5 text-gray-700 text-sm leading-relaxed">
            {listItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    const flushCode = (key) => {
      if (codeBlock.length > 0) {
        elements.push(
          <pre key={`code-${key}`} className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto mb-4 border border-slate-800">
            <code>{codeBlock.join('\n')}</code>
          </pre>
        );
        codeBlock = [];
        inCode = false;
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Handle Code Block toggles
      if (trimmed.startsWith('```')) {
        if (inCode) {
          flushCode(index);
        } else {
          flushList(index);
          inCode = true;
        }
        return;
      }

      // Collect code block lines
      if (inCode) {
        codeBlock.push(line);
        return;
      }

      // Headers
      if (trimmed.startsWith('#')) {
        flushList(index);
        const depth = trimmed.match(/^#+/)[0].length;
        const textContent = trimmed.replace(/^#+\s*/, '');

        if (depth === 1) {
          elements.push(
            <h2 key={index} className="text-xl font-extrabold text-gray-900 mt-6 mb-3 pb-1 border-b border-gray-100">
              {textContent}
            </h2>
          );
        } else if (depth === 2) {
          elements.push(
            <h3 key={index} className="text-lg font-bold text-gray-900 mt-5 mb-2.5 pb-1 border-b border-gray-50">
              {textContent}
            </h3>
          );
        } else {
          elements.push(
            <h4 key={index} className="text-md font-bold text-gray-800 mt-4 mb-2">
              {textContent}
            </h4>
          );
        }
        return;
      }

      // Bullet lists
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        inList = true;
        listItems.push(trimmed.substring(2));
        return;
      }

      // Standard non-list, non-code elements
      if (inList) {
        flushList(index);
      }

      if (!trimmed) {
        elements.push(<div key={index} className="h-3" />);
      } else {
        elements.push(
          <p key={index} className="text-gray-600 text-sm leading-relaxed mb-3">
            {line}
          </p>
        );
      }
    });

    // Final flushes
    flushList(lines.length);
    flushCode(lines.length);

    return elements;
  };

  return (
    <div className="prose max-w-none bg-slate-50 p-6 rounded-xl border border-border">
      <div className="space-y-1">{parseDocumentation(documentation)}</div>
    </div>
  );
};

export default DocumentationViewer;
