import { memo, useCallback } from "react";

interface FilterCheckboxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
    checkmarkClassName?: string;
    labelTextClassName?: string;
}

const FilterCheckbox = memo(function FilterCheckbox({
    label,
    checked,
    onChange,
    className,
    checkmarkClassName,
    labelTextClassName,
}: FilterCheckboxProps) {
    const handleChange = useCallback(() => onChange(!checked), [onChange, checked]);

    return (
        <label className={className}>
            <input type="checkbox" checked={checked} onChange={handleChange} style={{ display: "none" }} />
            <span className={checkmarkClassName} />
            <span className={labelTextClassName}>{label}</span>
        </label>
    );
});

export default FilterCheckbox;
