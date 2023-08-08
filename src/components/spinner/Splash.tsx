import React, { CSSProperties } from "react";
import "./splash.css";

export interface SplashProps {
  active: boolean | false;
  iconStyles?: CSSProperties;
  blockUi?: boolean;
}

export const Splash: React.FC<SplashProps> = ({
  active,
  iconStyles,
  blockUi,
}) => {
  return (
    <>
      {active && blockUi && (
        <div className="splash-block-ui">
          <div className="splash active">
            <div className="splash-icon" style={iconStyles}></div>
          </div>
        </div>
      )}
      {active && !blockUi && (
        <div className="splash active">
          <div className="splash-icon" style={iconStyles}></div>
        </div>
      )}
    </>
  );
};
