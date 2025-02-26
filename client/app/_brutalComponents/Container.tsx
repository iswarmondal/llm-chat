import { ReactNode } from "react";
import classNames from "classnames";

type ContainerProps = {
  children: ReactNode;
  bgColor?:
    | "yellow"
    | "green"
    | "blue"
    | "purple"
    | "orange"
    | "pink"
    | "white";
  shadowSize?: "sm" | "md" | "lg" | "none";
  className?: string;
};

const Container = ({
  children,
  bgColor = "white",
  shadowSize = "md",
  className,
}: ContainerProps) => {
  return (
    <div
      className={classNames(
        "border-4 border-black",
        {
          "bg-yellow-400": bgColor === "yellow",
          "bg-green-400": bgColor === "green",
          "bg-blue-400": bgColor === "blue",
          "bg-purple-400": bgColor === "purple",
          "bg-orange-400": bgColor === "orange",
          "bg-pink-400": bgColor === "pink",
          "bg-white": bgColor === "white",
        },
        {
          "shadow-[0_0_0_0_#000]": shadowSize === "none",
          "shadow-[4px_4px_0_0_#000]": shadowSize === "sm",
          "shadow-[8px_8px_0_0_#000]": shadowSize === "md",
          "shadow-[12px_12px_0_0_#000]": shadowSize === "lg",
        },
        className
      )}
    >
      {children}
    </div>
  );
};

export default Container;
