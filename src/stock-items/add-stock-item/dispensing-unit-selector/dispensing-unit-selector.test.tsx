import React from "react";

import { render, cleanup } from "@testing-library/react";
import DispensingUnitSelector from "./dispensing-unit-selector.component";

describe("Test the dispensing unit selector", () => {
  afterEach(cleanup);
  it(`renders without dying`, () => {
    render(<DispensingUnitSelector />);
  });
});