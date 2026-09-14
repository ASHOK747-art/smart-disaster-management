import "./Button.css";

/**
 * Button
 * variant: "primary" | "secondary" | "outline" | "critical" | "ghost"
 * size: "sm" | "md" | "lg"
 */
function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  fullWidth = false,
  as: Component = "button",
  className = "",
  ...props
}) {
  const classes = [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? "btn--full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...props}>
      {Icon && iconPosition === "left" && <Icon size={size === "lg" ? 20 : 16} />}
      <span>{children}</span>
      {Icon && iconPosition === "right" && <Icon size={size === "lg" ? 20 : 16} />}
    </Component>
  );
}

export default Button;
