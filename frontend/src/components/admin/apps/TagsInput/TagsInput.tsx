import { useState } from "react";
import form from "../../shared/_form.module.scss";

interface TagsInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
}

export default function TagsInput({ tags, onChange }: TagsInputProps) {
    const [input, setInput] = useState("");

    const addTag = (val: string) => {
        const v = val.trim().toLowerCase();
        if (v && !tags.includes(v)) onChange([...tags, v]);
        setInput("");
    };

    return (
        <div className={form.tagsInput}>
            {tags.map(t => (
                <span key={t} className={form.tag}>
                    {t}
                    <button type="button" onClick={() => onChange(tags.filter(x => x !== t))}>×</button>
                </span>
            ))}
            <input
                className={form.tagInput}
                placeholder="Add tag, press Enter..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(input); }
                    if (e.key === "Backspace" && !input && tags.length) onChange(tags.slice(0, -1));
                }}
                onBlur={() => input.trim() && addTag(input)}
            />
        </div>
    );
}
