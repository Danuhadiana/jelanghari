import React from 'react';

interface Props {
    text: string;
    className?: string;
    isUser?: boolean;
}

// Regex pembersih emoji secara ketat
const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{200D}]/gu;

type Block =
    | { type: 'header'; text: string; level: number }
    | { type: 'numbered-list'; items: { num: string; text: string }[] }
    | { type: 'bullet-list'; items: string[] }
    | { type: 'paragraph'; text: string };

export default function FormattedAiText({ text, className = '', isUser = false }: Props) {
    if (!text) return null;

    // Bersihkan emoji secara mutlak
    const cleanText = text.replace(EMOJI_REGEX, '').trim();

    if (isUser) {
        return (
            <p className={`whitespace-pre-wrap leading-relaxed text-xs ${className}`}>
                {cleanText}
            </p>
        );
    }

    // Helper merender inline formatting: **bold** dan `code`
    const renderInline = (content: string) => {
        const parts: React.ReactNode[] = [];
        let remaining = content;
        let keyCounter = 0;

        const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
        let match: RegExpExecArray | null;
        let lastIndex = 0;

        while ((match = tokenRegex.exec(remaining)) !== null) {
            if (match.index > lastIndex) {
                parts.push(remaining.substring(lastIndex, match.index));
            }

            const token = match[0];
            if (token.startsWith('**') && token.endsWith('**')) {
                const inner = token.slice(2, -2);
                parts.push(
                    <strong key={`bold-${keyCounter++}`} className="font-bold text-zinc-950 dark:text-zinc-50">
                        {inner}
                    </strong>
                );
            } else if (token.startsWith('`') && token.endsWith('`')) {
                const inner = token.slice(1, -1);
                parts.push(
                    <code
                        key={`code-${keyCounter++}`}
                        className="px-1.5 py-0.5 mx-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-emerald-800 dark:text-emerald-300 font-mono text-[10.5px] font-semibold border border-zinc-200/90 dark:border-zinc-700"
                    >
                        {inner}
                    </code>
                );
            }

            lastIndex = match.index + token.length;
        }

        if (lastIndex < remaining.length) {
            parts.push(remaining.substring(lastIndex));
        }

        return parts.length > 0 ? parts : content;
    };

    // Parser block-level terstruktur: Mengelompokkan list berurutan agar spacing tidak berjauhan
    const rawLines = cleanText.replace(/\r\n/g, '\n').split('\n');
    const blocks: Block[] = [];
    let currentNumberedList: { num: string; text: string }[] | null = null;
    let currentBulletList: string[] | null = null;

    const flushCurrentList = () => {
        if (currentNumberedList && currentNumberedList.length > 0) {
            blocks.push({ type: 'numbered-list', items: [...currentNumberedList] });
            currentNumberedList = null;
        }
        if (currentBulletList && currentBulletList.length > 0) {
            blocks.push({ type: 'bullet-list', items: [...currentBulletList] });
            currentBulletList = null;
        }
    };

    for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i].trim();

        // Baris kosong
        if (!line) {
            flushCurrentList();
            continue;
        }

        // Header: ### Judul, ## Judul, atau # Judul
        if (line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ')) {
            flushCurrentList();
            const level = line.startsWith('### ') ? 3 : line.startsWith('## ') ? 2 : 1;
            const headerText = line.replace(/^#+\s*/, '');
            blocks.push({ type: 'header', text: headerText, level });
            continue;
        }

        // Numbered item: 1. Text, 2. Text
        const numberedMatch = line.match(/^(\d+)[\.\)]\s+(.*)$/);
        if (numberedMatch) {
            if (currentBulletList) {
                flushCurrentList();
            }
            if (!currentNumberedList) {
                currentNumberedList = [];
            }
            currentNumberedList.push({ num: numberedMatch[1], text: numberedMatch[2] });
            continue;
        }

        // Bullet item: • Text, - Text, * Text
        const bulletMatch = line.match(/^([•\-\*])\s+(.*)$/);
        if (bulletMatch) {
            if (currentNumberedList) {
                flushCurrentList();
            }
            if (!currentBulletList) {
                currentBulletList = [];
            }
            currentBulletList.push(bulletMatch[2]);
            continue;
        }

        // Paragraph biasa
        flushCurrentList();
        blocks.push({ type: 'paragraph', text: line });
    }

    flushCurrentList();

    return (
        <div className={`space-y-2 text-xs leading-normal text-zinc-700 dark:text-zinc-200 ${className}`}>
            {blocks.map((block, bIdx) => {
                switch (block.type) {
                    case 'header':
                        return (
                            <div key={`h-${bIdx}`} className="pt-1.5 pb-0.5 border-b border-zinc-200/80 dark:border-zinc-800">
                                <h4 className="font-bold text-[12px] sm:text-[13px] text-zinc-950 dark:text-zinc-100 tracking-tight uppercase flex items-center gap-1.5">
                                    <span className="w-1.5 h-3 bg-emerald-600 dark:bg-emerald-400 rounded-full inline-block shrink-0" />
                                    <span>{renderInline(block.text)}</span>
                                </h4>
                            </div>
                        );

                    case 'numbered-list':
                        return (
                            <ol key={`ol-${bIdx}`} className="space-y-1 my-1 pl-0.5">
                                {block.items.map((item, itemIdx) => (
                                    <li key={`num-${itemIdx}`} className="flex items-start gap-2">
                                        <span className="shrink-0 w-4 h-4 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-mono font-bold flex items-center justify-center border border-zinc-200/80 dark:border-zinc-700 mt-0.5">
                                            {item.num}
                                        </span>
                                        <div className="flex-1 min-w-0 leading-relaxed text-zinc-700 dark:text-zinc-200">
                                            {renderInline(item.text)}
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        );

                    case 'bullet-list':
                        return (
                            <ul key={`ul-${bIdx}`} className="space-y-1 my-1 pl-0.5">
                                {block.items.map((item, itemIdx) => (
                                    <li key={`bul-${itemIdx}`} className="flex items-start gap-2">
                                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-1.5" />
                                        <div className="flex-1 min-w-0 leading-relaxed text-zinc-700 dark:text-zinc-200">
                                            {renderInline(item)}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        );

                    case 'paragraph':
                        return (
                            <p key={`p-${bIdx}`} className="leading-relaxed text-zinc-700 dark:text-zinc-200">
                                {renderInline(block.text)}
                            </p>
                        );

                    default:
                        return null;
                }
            })}
        </div>
    );
}
