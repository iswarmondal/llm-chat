"use client";

import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import classNames from "classnames";

type ExpandableTextareaProps = {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  disabled?: boolean;
  className?: string;
  minRows?: number;
  maxRows?: number;
};

const ExpandableTextarea = ({
  placeholder = "Type a message...",
  value: externalValue,
  onChange,
  onSubmit,
  size = "full",
  disabled = false,
  className,
  minRows = 1,
  maxRows = 5,
}: ExpandableTextareaProps) => {
  const [internalValue, setInternalValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const value = externalValue !== undefined ? externalValue : internalValue;

  // Adjust height based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to calculate proper scrollHeight
    textarea.style.height = "auto";

    // Calculate new height based on scrollHeight, with min and max constraints
    const lineHeight = 24; // Approximate line height in pixels
    const minHeight = minRows * lineHeight;
    const maxHeight = maxRows * lineHeight;

    const newHeight = Math.min(
      Math.max(textarea.scrollHeight, minHeight),
      maxHeight
    );
    textarea.style.height = `${newHeight}px`;
  }, [value, minRows, maxRows]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && onSubmit) {
      e.preventDefault();
      if (value.trim()) {
        onSubmit(value);
        if (!onChange) {
          setInternalValue("");
        }
      }
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      placeholder={placeholder}
      rows={minRows}
      className={classNames(
        "min-h-16 max-h-full border-4 border-black px-3 font-medium transition-all resize-none overflow-auto",
        "focus:outline-none focus:shadow-none active:shadow-none",
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

export default ExpandableTextarea;
