import classNames from "classnames";

type ButtonProps = {
  buttonText: string;
  buttonType: "primary" | "secondary";
  size?: "sm" | "md" | "lg" | "xl" | "full";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

const Button = ({
  buttonText,
  buttonType,
  size = "sm",
  disabled = false,
  onClick,
  className,
}: ButtonProps) => {
  return (
    <button
      className={classNames(
        "border-4 border-black py-2 font-bold active:translate-y-1 active:shadow-none hover:shadow-[3px_3px_0_0_#333] transition-all",
        {
          "bg-white text-black shadow-[4px_4px_0_0_#000]":
            buttonType === "secondary",
          "bg-black text-white shadow-[4px_4px_0_0_#333]":
            buttonType === "primary",
        },
        {
          "w-full": size === "full",
          "w-64 md:w-1/2 px-6": size === "xl",
          "w-52 md:w-1/3 px-4": size === "lg",
          "w-40 md:w-1/4 px-2": size === "md",
          "w-32 md:w-1/5 px-1": size === "sm",
        },
        {
          "opacity-50 shadow-none transition-none active:shadow-none active:translate-y-0":
            disabled,
        },
        className
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {buttonText}
    </button>
  );
};

export default Button;
