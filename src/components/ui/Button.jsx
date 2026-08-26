import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-xs shadow-brand-600/20 disabled:bg-steel-200 disabled:text-steel-400 disabled:shadow-none",
  secondary:
    "bg-white text-steel-700 border border-steel-200 hover:bg-steel-50 hover:border-steel-300 active:bg-steel-100 disabled:text-steel-300 disabled:border-steel-100",
  ghost:
    "bg-transparent text-steel-600 hover:bg-steel-100 hover:text-steel-800 active:bg-steel-200 disabled:text-steel-300",
  danger:
    "bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 active:bg-red-100 disabled:text-red-200 disabled:border-red-100",
};

const SIZES = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-[36px] px-4 text-[13px] gap-2 rounded-lg",
  lg: "h-11 px-5 text-sm gap-2 rounded-xl",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  loading = false,
  className = "",
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium
        transition-all duration-150 disabled:cursor-not-allowed
        focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-2
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        Icon && <Icon className="h-[15px] w-[15px]" strokeWidth={2} />
      )}
      {children}
    </button>
  );
}
