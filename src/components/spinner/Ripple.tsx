import React from "react";
import "./ripple.css";

export interface RippleProps {
  visible?: boolean;
  width?: string;
  height?: string;
  className?: string;
  title?: string;
}

export const Ripple: React.FC<RippleProps> = ({
  visible,
  width,
  height,
  className,
  title,
}) => {
  return (
    <>
      {visible && (
        <div
          title={title}
          className={`ripple-loading${className ? ` ${className}` : ""}`}
          style={{ height: height }}
        >
          <div
            className="ripple-container"
            style={{ width: width, height: height }}
          >
            <div
              className="ripple"
              style={{ width: width, height: height }}
            ></div>
            <div
              className="ripple"
              style={{ width: width, height: height }}
            ></div>
            <div
              className="ripple"
              style={{ width: width, height: height }}
            ></div>
          </div>
        </div>
      )}
    </>
  );
};

Ripple.defaultProps = {
  visible: true,
  width: "50px",
  height: "50px",
};
