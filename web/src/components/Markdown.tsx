// Markdown renderer แบบจำกัด (หัวข้อ, ย่อหน้า, list, ตัวหนา) — สร้าง React element ไม่ใช้ innerHTML
import type { ReactNode } from 'react';

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part,
  );
}

export function Markdown({ source }: { source: string }) {
  const blocks = source.replace(/\r\n/g, '\n').split(/\n{2,}/);
  return (
    <>
      {blocks.map((b, i) => {
        const lines = b.split('\n');
        if (b.startsWith('### ')) return <h3 key={i}>{inline(b.slice(4))}</h3>;
        if (b.startsWith('## ')) return <h2 key={i}>{inline(b.slice(3))}</h2>;
        if (lines.every((l) => l.startsWith('- '))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.slice(2))}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{inline(lines.join(' '))}</p>;
      })}
    </>
  );
}
