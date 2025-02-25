import { ReactNode } from "react";
import classNames from "classnames";

type HeadingTextProps = {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  color?: "black" | "white";
  className?: string;
};

const HeadingText = ({
  children,
  level = 1,
  color = "black",
  className,
}: HeadingTextProps) => {
  // Render different heading levels
  if (level === 1)
    return (
      <h1 className={getHeadingClasses(level, color, className)}>{children}</h1>
    );
  if (level === 2)
    return (
      <h2 className={getHeadingClasses(level, color, className)}>{children}</h2>
    );
  if (level === 3)
    return (
      <h3 className={getHeadingClasses(level, color, className)}>{children}</h3>
    );
  if (level === 4)
    return (
      <h4 className={getHeadingClasses(level, color, className)}>{children}</h4>
    );
  if (level === 5)
    return (
      <h5 className={getHeadingClasses(level, color, className)}>{children}</h5>
    );
  return (
    <p className={getHeadingClasses(level, color, className)}>{children}</p>
  );
};

const getHeadingClasses = (
  level: number,
  color: string = "black",
  className?: string
) => {
  return classNames(
    "font-bolder py-2 inline-block",
    {
      "text-5xl": level === 1,
      "text-4xl": level === 2,
      "text-3xl": level === 3,
      "text-2xl": level === 4,
      "text-xl": level === 5,
      "text-lg": level === 6,
    },
    {
      "text-black": color === "black",
      "text-white": color === "white",
    },
    className
  );
};

export default HeadingText;
