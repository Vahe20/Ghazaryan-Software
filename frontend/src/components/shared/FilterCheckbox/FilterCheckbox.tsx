import { memo, useCallback } from "react";
import style from "./FilterCheckbox.module.scss";

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
        <label className={`${style.checkboxLabel} ${className ?? ""}`} data-checked={checked}>
            <input
                type="checkbox"
                checked={checked}
                onChange={handleChange}
                className={style.hiddenInput}
            />
            <span className={`${style.checkmark} ${checkmarkClassName ?? ""} ${checked ? style.checked : ""}`}>
                <svg
                    className={style.checkIcon}
                    viewBox="0 0 12 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M1 5L4.5 8.5L11 1"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </span>
            <span className={`${style.labelText} ${labelTextClassName ?? ""} ${checked ? style.labelChecked : ""}`}>
                {label}
            </span>
        </label>
    );
});

export default FilterCheckbox;
