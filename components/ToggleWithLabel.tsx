"use client";

type ToggleProps = {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
};

export default function ToggleWithLabel({
    label,
    checked,
    onChange,
    disabled,
}: ToggleProps) {
    return (
        <label className="inline-flex items-center cursor-pointer gap-3">
            <input
                type="checkbox"
                className="sr-only peer"
                checked={checked}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
            />

            <div
                className="
                    relative w-9 h-5 rounded-full
                    bg-neutral-quaternary
                    peer-focus:outline-none
                    peer-focus:ring-4 peer-focus:ring-brand-soft
                    transition-colors
                    peer-checked:bg-brand
                    disabled:opacity-50
                "
            >
                <div
                    className="
                        absolute top-[2px] left-[2px]
                        h-4 w-4 rounded-full bg-white
                        transition-transform
                        peer-checked:translate-x-4
                    "
                />
            </div>

            <span className="select-none text-sm font-medium text-heading">
                {label}
            </span>
        </label>
    );
}
