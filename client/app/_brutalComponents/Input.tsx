"use client";

import { useState } from "react";
import classNames from "classnames";

type InputProps = {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: "text" | "password" | "email";
  size?: "sm" | "md" | "lg" | "xl" | "full";
  disabled?: boolean;
  className?: string;
};

const Input = ({
  placeholder,
  value: externalValue,
  onChange,
  type = "text",
  size = "xl",
  disabled = false,
  className,
}: InputProps) => {
  const [internalValue, setInternalValue] = useState("");

  const value = externalValue !== undefined ? externalValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  return (
    <input
      type={type}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      placeholder={placeholder}
      className={classNames(
        "border-4 border-black py-2 px-3 font-medium transition-all",
        "focus:outline-none shadow-[4px_4px_0_0_#000] focus:shadow-none active:shadow-none",
        "placeholder:text-gray-500",
        {
          "w-full": size === "full",
          "w-1/2": size === "xl",
          "w-1/3": size === "lg",
          "w-1/4": size === "md",
          "w-1/5": size === "sm",
          "opacity-50 cursor-not-allowed": disabled,
        },
        className
      )}
    />
  );
};

export default Input;
