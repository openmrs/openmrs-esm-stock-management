import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddEditStockItem from "./add-stock-item.component";
import { StockItemDTO } from "../../core/api/types/stockItem/StockItem";

// Mock components
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));
jest.mock("@carbon/react", () => {
  const originalModule = jest.requireActual("@carbon/react");
  return {
    ...originalModule,
    useMatchMedia: jest.fn().mockReturnValue(false),
  };
});

jest.mock("@carbon/react/icons", () => ({
  Save: () => <div>Save Icon</div>,
}));

jest.mock(
  "./stock-item-details/stock-item-details.component",
  () =>
    ({ model }) =>
      (
        <div data-testid="stock-item-details">
          Stock Item Details: {model.uuid}
        </div>
      )
);

jest.mock(
  "./packaging-units/packaging-units.component",
  () =>
    ({ stockItemUuid }) =>
      (
        <div data-testid="packaging-units">
          Packaging Units: {stockItemUuid || "N/A"}
        </div>
      )
);

jest.mock(
  "./transactions/transactions.component",
  () =>
    ({ stockItemUuid }) =>
      (
        <div data-testid="transactions">
          Transactions: {stockItemUuid || "N/A"}
        </div>
      )
);

jest.mock(
  "./batch-information/batch-information.component",
  () =>
    ({ stockItemUuid }) =>
      (
        <div data-testid="batch-information">
          Batch Information: {stockItemUuid || "N/A"}
        </div>
      )
);

jest.mock("./quantities/quantities.component", () => ({ stockItemUuid }) => (
  <div data-testid="quantities">Quantities: {stockItemUuid || "N/A"}</div>
));

jest.mock(
  "./stock-item-rules/stock-item-rules.component",
  () =>
    ({ stockItemUuid }) =>
      <div data-testid="stock-rules">Rules: {stockItemUuid || "N/A"}</div>
);

jest.mock(
  "./stock-item-references/stock-item-references.component",
  () =>
    ({ stockItemUuid }) =>
      (
        <div data-testid="stock-references">
          References: {stockItemUuid || "N/A"}
        </div>
      )
);

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe("AddEditStockItem", () => {
  const mockModel: StockItemDTO = {
    uuid: "test-uuid-123",
    isDrug: true,
    drugUuid: "drug-uuid-456",
    drugName: "Test Drug",
    conceptUuid: "concept-uuid-789",
    commonName: "Test Common Name",
    acronym: "TCN",
    conceptName: "Test Concept Name",
    hasExpiration: true,
    packagingUnits: [
      {
        uuid: "packaging-uuid-001",
        stockItemUuid: "test-uuid-123",
        packagingUomName: "Box",
        packagingUomUuid: "uom-uuid-001",
        factor: 100,
        isDefaultStockOperationsUoM: true,
        isDispensingUnit: false,
      },
    ],
    permission: {
      canView: true,
      canEdit: true,
      canApprove: false,
      canReceiveItems: true,
      canDisplayReceivedItems: true,
      isRequisitionAndCanIssueStock: false,
      canUpdateBatchInformation: true,
    },
    categoryUuid: "category-uuid-001",
    categoryName: "Test Category",
    preferredVendorUuid: "vendor-uuid-001",
    preferredVendorName: "Test Vendor",
    purchasePrice: 10.99,
    purchasePriceUoMUuid: "uom-uuid-002",
    purchasePriceUoMName: "Each",
    dispensingUnitName: "Tablet",
    dispensingUnitUuid: "uom-uuid-003",
    dispensingUnitPackagingUoMUuid: "uom-uuid-003",
    dispensingUnitPackagingUoMName: "Tablet",
    defaultStockOperationsUoMUuid: "uom-uuid-001",
    defaultStockOperationsUoMName: "Box",
    reorderLevel: 100,
    reorderLevelUoMUuid: "uom-uuid-001",
    reorderLevelUoMName: "Box",
    dateCreated: new Date("2023-05-01T10:00:00Z"),
    creatorGivenName: "John",
    creatorFamilyName: "Doe",
    voided: false,
    expiryNotice: 30,
  };

  it("renders correctly with initial state and default selected tab", () => {
    render(<AddEditStockItem model={mockModel} />);
    expect(screen.getByTestId("stock-item-details")).toBeInTheDocument();
    expect(
      screen.getByText("Stock Item Details: test-uuid-123")
    ).toBeInTheDocument();
  });

  it("changes selected tab when clicking on different tabs", async () => {
    const user = userEvent.setup();
    render(<AddEditStockItem model={mockModel} isEditing={true} />);

    await user.click(screen.getByText("packagingUnits"));
    expect(screen.getByTestId("packaging-units")).toBeInTheDocument();
    expect(
      screen.getByText("Packaging Units: test-uuid-123")
    ).toBeInTheDocument();

    await user.click(screen.getByText("transactions"));
    expect(screen.getByTestId("transactions")).toBeInTheDocument();
    expect(screen.getByText("Transactions: test-uuid-123")).toBeInTheDocument();
  });

  it("disables tabs when isEditing is false", () => {
    render(<AddEditStockItem model={mockModel} isEditing={false} />);

    const disabledTabs = [
      "packagingUnits",
      "transactions",
      "batchInformation",
      "quantities",
      "stockRules",
      "references",
    ];
    disabledTabs.forEach((tabName) => {
      const tab = screen.getByText(tabName).closest("button");
      expect(tab).toHaveAttribute("aria-disabled", "true");
    });
  });

  it("enables tabs when isEditing is true", () => {
    render(<AddEditStockItem model={mockModel} isEditing={true} />);

    const enabledTabs = [
      "packagingUnits",
      "transactions",
      "batchInformation",
      "quantities",
      "stockRules",
      "references",
    ];
    enabledTabs.forEach((tabName) => {
      const tab = screen.getByText(tabName).closest("button");
      expect(tab).not.toHaveAttribute("aria-disabled", "true");
    });
  });

  it("renders correct components based on model prop", async () => {
    const user = userEvent.setup();
    render(<AddEditStockItem model={mockModel} isEditing={true} />);

    expect(
      screen.getByText("Stock Item Details: test-uuid-123")
    ).toBeInTheDocument();

    await user.click(screen.getByText("packagingUnits"));
    expect(
      screen.getByText("Packaging Units: test-uuid-123")
    ).toBeInTheDocument();

    await user.click(screen.getByText("transactions"));
    expect(screen.getByText("Transactions: test-uuid-123")).toBeInTheDocument();

    await user.click(screen.getByText("batchInformation"));
    expect(
      screen.getByText("Batch Information: test-uuid-123")
    ).toBeInTheDocument();

    await user.click(screen.getByText("quantities"));
    expect(screen.getByText("Quantities: test-uuid-123")).toBeInTheDocument();

    await user.click(screen.getByText("stockRules"));
    expect(screen.getByText("Rules: test-uuid-123")).toBeInTheDocument();

    await user.click(screen.getByText("references"));
    expect(screen.getByText("References: test-uuid-123")).toBeInTheDocument();
  });

  it("translates tab names correctly", () => {
    render(<AddEditStockItem model={mockModel} />);

    const tabNames = [
      "stockItemDetails",
      "packagingUnits",
      "transactions",
      "batchInformation",
      "quantities",
      "stockRules",
      "references",
    ];
    tabNames.forEach((tabName) => {
      expect(screen.getByText(tabName)).toBeInTheDocument();
    });
  });
});
