import React, { useEffect, useRef, useState } from "react";
import styles from "./CustomOverflowMenu.module.scss";

interface CustomOverflowMenuComponentProps {
  menuTitle: React.ReactNode;
}

const CustomOverflowMenuComponent: React.FC<
  CustomOverflowMenuComponentProps
> = ({ menuTitle, children }) => {
  const [showMenu, setShowMenu] = useState(false);
  const wrapperRef = useRef(null);
  const toggleShowMenu = () => setShowMenu((state) => !state);

  useEffect(() => {
    /**
     * Toggle showMenu if clicked on outside of element
     */
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !(wrapperRef.current as any).contains(event.target)
      ) {
        setShowMenu(false);
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <div
      data-overflow-menu
      className={`bx--overflow-menu ${styles.overflowMenu}`}
      ref={wrapperRef}
    >
      <button
        className={`bx--overflow-menu__trigger ${styles.overflowMenuButton} ${
          showMenu && "bx--overflow-menu--open "
        } bx--btn bx--btn--sm bx--btn--primary`}
        aria-haspopup="true"
        aria-expanded={showMenu}
        id="custom-actions-overflow-menu-trigger"
        aria-controls="custom-actions-overflow-menu"
        onClick={toggleShowMenu}
        style={{}}
      >
        {menuTitle}
      </button>
      <div
        className={`bx--overflow-menu-options ${styles.menuOptions} bx--overflow-menu--flip`}
        tabIndex={0}
        data-floating-menu-direction="bottom"
        role="menu"
        aria-labelledby="custom-actions-overflow-menu-trigger"
        id="custom-actions-overflow-menu"
        style={{
          display: showMenu ? "block" : "none",
        }}
      >
        <ul className="bx--overflow-menu-options__content">{children}</ul>
        <span />
      </div>
    </div>
  );
};

export default CustomOverflowMenuComponent;
