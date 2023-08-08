/*
From openmrs esm framework window size detection.
https://github.com/openmrs/openmrs-esm-core/blob/main/packages/framework/esm-styleguide/src/breakpoints/index.ts
https://github.com/openmrs/openmrs-esm-core/blob/main/packages/framework/esm-react-utils/src/useLayoutType.ts
Remove when upgraded to esm and use the esm framework provided tools
*/
import { useEffect, useState } from "react";
export const Breakpoint = {
  PHONE_MIN: 0,
  PHONE_MAX: 600,
  TABLET_MIN: 601,
  TABLET_MAX: 1023,
  SMALL_DESKTOP_MIN: 1024,
  SMALL_DESKTOP_MAX: 1439,
  LARGE_DESKTOP_MIN: 1440,
  LARGE_DESKTOP_MAX: Number.MAX_SAFE_INTEGER,
} as const;

function setBodyCssClasses() {
  document.body.classList.toggle(
    "stockmgmt-lt-tablet",
    window.innerWidth < Breakpoint.TABLET_MIN
  );
  document.body.classList.toggle(
    "stockmgmt-gt-phone",
    window.innerWidth > Breakpoint.PHONE_MAX
  );
  document.body.classList.toggle(
    "stockmgmt-gt-tablet",
    window.innerWidth > Breakpoint.TABLET_MAX
  );
  document.body.classList.toggle(
    "stockmgmt-lt-desktop",
    window.innerWidth < Breakpoint.SMALL_DESKTOP_MIN
  );
  document.body.classList.toggle(
    "stockmgmt-lt-small-desktop",
    window.innerWidth < Breakpoint.SMALL_DESKTOP_MIN
  );
  document.body.classList.toggle(
    "stockmgmt-lt-large-desktop",
    window.innerWidth < Breakpoint.LARGE_DESKTOP_MIN
  );
  document.body.classList.toggle(
    "stockmgmt-gt-small-desktop",
    window.innerWidth > Breakpoint.SMALL_DESKTOP_MAX
  );
}

export function integrateBreakpoints() {
  window.addEventListener("resize", setBodyCssClasses);
  setBodyCssClasses();
}

export enum LayoutType {
  phone = "phone",
  tablet = "tablet",
  small_desktop = "small-desktop",
  large_desktop = "large-desktop",
}

function getLayout() {
  let layout: LayoutType = LayoutType.large_desktop;

  document.body.classList.forEach((cls) => {
    switch (cls) {
      case "stockmgmt-lt-tablet":
        layout = LayoutType.phone;
        break;
      case "stockmgmt-gt-small-desktop":
        layout = LayoutType.large_desktop;
        break;
      case "stockmgmt-gt-tablet":
        layout = LayoutType.small_desktop;
        break;
    }
  });

  return layout;
}

export function useLayoutType() {
  const [type, setType] = useState<LayoutType>(getLayout);

  useEffect(() => {
    const handler = () => {
      setType(getLayout());
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return type;
}

export const isDesktopLayout = (layout: LayoutType) =>
  layout === LayoutType.small_desktop || layout === LayoutType.large_desktop;
