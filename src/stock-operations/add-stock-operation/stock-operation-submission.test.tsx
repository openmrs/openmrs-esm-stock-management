import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import StockOperationSubmission from "./stock-operation-submission.component";
import { StockOperationDTO } from "../../core/api/types/stockOperation/StockOperationDTO";
import { StockOperationType } from "../../core/api/types/stockOperation/StockOperationType";
import { InitializeResult } from "./types";

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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    const { getByText } = render(
      <StockOperationSubmission {...defaultProps} />
    );
    expect(
      getByText(/does the transaction require approval/i)
    ).toBeInTheDocument();
  });

  it("allows approval required to be selected", () => {
    const { getByLabelText } = render(
      <StockOperationSubmission {...defaultProps} />
    );

    fireEvent.click(getByLabelText(/yes/i));

    const yesRadioButton = getByLabelText(/yes/i) as HTMLInputElement;
    expect(yesRadioButton.checked).toBe(true);
  });

  it("allows approval not required to be selected", () => {
    const { getByLabelText } = render(
      <StockOperationSubmission {...defaultProps} />
    );
    fireEvent.click(getByLabelText(/no/i));
    const noRadioButton = getByLabelText(/no/i) as HTMLInputElement;
    expect(noRadioButton.checked).toBe(true);
  });

  it("calls onGoBack when Go Back button is clicked", () => {
    const { getByText } = render(
      <StockOperationSubmission {...defaultProps} />
    );

    fireEvent.click(getByText(/go back/i));
    expect(mockOnGoBack).toHaveBeenCalled();
  });

  it("shows loading indicator when saving", async () => {
    const { getByText } = render(
      <StockOperationSubmission {...defaultProps} />
    );

    fireEvent.click(getByText(/save/i));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it("calls onSave when save button is clicked", async () => {
    const { getByText } = render(
      <StockOperationSubmission {...defaultProps} />
    );

    fireEvent.click(getByText(/save/i));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it("disables the save button while saving", async () => {
    const { getByRole } = render(
      <StockOperationSubmission {...defaultProps} />
    );

    const saveButton = getByRole("button", { name: "Save" });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(saveButton).toBeDisabled();
    });
    await waitFor(() => {
      expect(saveButton).not.toBeDisabled();
    });
  });

  it("calls onComplete when Complete button is clicked", async () => {
    const { getByText } = render(
      <StockOperationSubmission {...defaultProps} />
    );
    fireEvent.click(getByText(/complete/i));
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });
});
