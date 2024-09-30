import React from "react";
import { render, waitFor } from "@testing-library/react";
import StockOperationSubmission from "./stock-operation-submission.component";
import { StockOperationDTO } from "../../core/api/types/stockOperation/StockOperationDTO";
import { StockOperationType } from "../../core/api/types/stockOperation/StockOperationType";
import { InitializeResult } from "./types";
import userEvent from "@testing-library/user-event";

const mockOnGoBack = jest.fn();
const mockOnSave = jest.fn();
const mockOnComplete = jest.fn();
const mockOnSubmit = jest.fn();
const mockOnDispatch = jest.fn();
const defaultProps = {
  canEdit: true,
  locked: false,
  model: { approvalRequired: null } as StockOperationDTO,
  operation: {
    name: "Stock Issue",
    description: "Issuing stock",
    operationType: "stockissue",
    hasSource: true,
    sourceType: {},
    hasDestination: true,
    destinationType: {},
    hasRecipient: false,
    recipientRequired: false,
    availableWhenReserved: false,
    allowExpiredBatchNumbers: false,
    stockOperationTypeLocationScopes: [],
  } as StockOperationType,
  setup: {
    isNegativeQuantityAllowed: false,
    requiresBatchUuid: false,
    requiresActualBatchInfo: false,
    isQuantityOptional: false,
  } as InitializeResult,
  actions: {
    onGoBack: mockOnGoBack,
    onSave: mockOnSave,
    onComplete: mockOnComplete,
    onSubmit: mockOnSubmit,
    onDispatch: mockOnDispatch,
  },
};

describe("StockOperationSubmission", () => {
  let user;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
  });

  it("renders without crashing", () => {
    const { getByText } = render(
      <StockOperationSubmission {...defaultProps} />
    );
    expect(
      getByText(/does the transaction require approval/i)
    ).toBeInTheDocument();
  });

  it("allows approval required to be selected", async () => {
    const { getByLabelText } = render(
      <StockOperationSubmission {...defaultProps} />
    );

    await user.click(getByLabelText(/yes/i));

    const yesRadioButton = getByLabelText(/yes/i) as HTMLInputElement;
    expect(yesRadioButton.checked).toBe(true);
  });

  it("allows approval not required to be selected", async () => {
    const { getByLabelText } = render(
      <StockOperationSubmission {...defaultProps} />
    );

    await user.click(getByLabelText(/no/i));

    const noRadioButton = getByLabelText(/no/i) as HTMLInputElement;
    expect(noRadioButton.checked).toBe(true);
  });

  it("calls onGoBack when Go Back button is clicked", async () => {
    const { getByText } = render(
      <StockOperationSubmission {...defaultProps} />
    );

    await user.click(getByText(/go back/i));

    expect(mockOnGoBack).toHaveBeenCalled();
  });

  it("shows loading indicator when saving", async () => {
    const { getByText } = render(
      <StockOperationSubmission {...defaultProps} />
    );

    await user.click(getByText(/save/i));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it("calls onSave when save button is clicked", async () => {
    const { getByText } = render(
      <StockOperationSubmission {...defaultProps} />
    );

    await user.click(getByText(/save/i));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it("disables the save button while saving", async () => {
    const mockOnSave = jest.fn<Promise<void>, [StockOperationDTO]>(
      (model) => new Promise((resolve) => setTimeout(resolve, 500))
    );

    const testProps = {
      ...defaultProps,
      actions: {
        ...defaultProps.actions,
        onSave: mockOnSave,
      },
    };

    const { getByRole } = render(<StockOperationSubmission {...testProps} />);
    const saveButton = getByRole("button", { name: "Save" });
    await user.click(saveButton);

    await waitFor(() => {
      expect(saveButton).not.toBeDisabled();
    });
  });

  it("calls onComplete when Complete button is clicked", async () => {
    const { getByText } = render(
      <StockOperationSubmission {...defaultProps} />
    );

    await user.click(getByText(/complete/i));

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  it("does not render buttons when locked", () => {
    const lockedProps = {
      ...defaultProps,
      locked: true,
    };

    const { queryByRole } = render(
      <StockOperationSubmission {...lockedProps} />
    );

    expect(queryByRole("button", { name: /save/i })).not.toBeInTheDocument();
    expect(
      queryByRole("button", { name: /complete/i })
    ).not.toBeInTheDocument();
  });
});
