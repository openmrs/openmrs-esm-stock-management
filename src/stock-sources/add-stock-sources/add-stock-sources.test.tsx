import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StockSourcesAddOrUpdate from "./add-stock-sources.component";
import { useConcept } from "../../stock-lookups/stock-lookups.resource";
import { createOrUpdateStockSource } from "../stock-sources.resource";
import { showSnackbar, useConfig } from "@openmrs/esm-framework";
import { closeOverlay } from "../../core/components/overlay/hook";
import { StockSource } from "../../core/api/types/stockOperation/StockSource";
import "@testing-library/jest-dom/extend-expect";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

jest.mock("@openmrs/esm-framework", () => ({
  showModal: jest.fn(),
  showSnackbar: jest.fn(),
  restBaseUrl: "http://localhost:8080",
}));

jest.mock("../stock-sources.resource", () => ({
  deleteStockSource: jest.fn(),
}));

jest.mock("../../utils", () => ({
  handleMutate: jest.fn(),
}));

describe("StockSourcesAddOrUpdate", () => {
  const mockStockSourceTypeUUID = "mock-uuid";
  const mockItems = {
    answers: [
      { uuid: "type1", display: "Type 1" },
      { uuid: "type2", display: "Type 2" },
    ],
  };

  beforeEach(() => {
    (useConcept as jest.Mock).mockReturnValue({ items: mockItems });
    (useConfig as jest.Mock).mockReturnValue({
      stockSourceTypeUUID: mockStockSourceTypeUUID,
    });
  });

  it("renders correctly without model prop", () => {
    render(<StockSourcesAddOrUpdate />);
    expect(screen.getByLabelText("fullName")).toBeInTheDocument();
    expect(screen.getByLabelText("acronym")).toBeInTheDocument();
    expect(screen.getByLabelText("sourceType")).toBeInTheDocument();
  });

  it("renders correctly with model prop and sets sourceType", () => {
    const mockModel: StockSource = {
      uuid: "mock-uuid",
      name: "Test Source",
      acronym: "TS",
      sourceType: {
        uuid: "type1",
        display: "Type 1",
        conceptId: 0,
        set: false,
        version: "",
        names: [],
        name: undefined,
        numeric: false,
        complex: false,
        shortNames: [],
        indexTerms: [],
        synonyms: [],
        setMembers: [],
        possibleValues: [],
        preferredName: undefined,
        shortName: undefined,
        fullySpecifiedName: undefined,
        answers: [],
        creator: undefined,
        dateCreated: undefined,
        changedBy: undefined,
        dateChanged: undefined,
        retired: false,
        dateRetired: undefined,
        retiredBy: undefined,
        retireReason: "",
      },
      creator: undefined,
      dateCreated: undefined,
      changedBy: undefined,
      dateChanged: undefined,
      dateVoided: undefined,
      voidedBy: undefined,
      voidReason: "",
      voided: false,
    };
    render(<StockSourcesAddOrUpdate model={mockModel} />);
    expect(screen.getByLabelText("fullName")).toHaveValue("Test Source");
    expect(screen.getByLabelText("acronym")).toHaveValue("TS");
    expect(screen.getByLabelText("sourceType")).toHaveValue("type1");
    expect(screen.queryByText("chooseSourceType")).not.toBeInTheDocument();
  });

  it("updates form fields correctly on user input", async () => {
    render(<StockSourcesAddOrUpdate />);

    await userEvent.type(screen.getByLabelText("fullName"), "New Source");
    await userEvent.type(screen.getByLabelText("acronym"), "NS");
    await userEvent.selectOptions(screen.getByLabelText("sourceType"), "type2");

    expect(screen.getByLabelText("fullName")).toHaveValue("New Source");
    expect(screen.getByLabelText("acronym")).toHaveValue("NS");
    expect(screen.getByLabelText("sourceType")).toHaveValue("type2");
  });

  it("calls createOrUpdateStockSource with correct data on form submission", async () => {
    (createOrUpdateStockSource as jest.Mock).mockResolvedValue({});
    render(<StockSourcesAddOrUpdate />);

    await userEvent.type(screen.getByLabelText("fullName"), "New Source");
    await userEvent.type(screen.getByLabelText("acronym"), "NS");
    await userEvent.selectOptions(screen.getByLabelText("sourceType"), "type2");

    fireEvent.click(screen.getByText("save"));

    await waitFor(() => {
      expect(createOrUpdateStockSource).toHaveBeenCalledWith(
        expect.objectContaining<Partial<StockSource>>({
          name: "New Source",
          acronym: "NS",
          sourceType: {
            uuid: "type2",
            display: "Type 2",
            conceptId: 0,
            set: false,
            version: "",
            names: [],
            name: undefined,
            numeric: false,
            complex: false,
            shortNames: [],
            indexTerms: [],
            synonyms: [],
            setMembers: [],
            possibleValues: [],
            preferredName: undefined,
            shortName: undefined,
            fullySpecifiedName: undefined,
            answers: [],
            creator: undefined,
            dateCreated: undefined,
            changedBy: undefined,
            dateChanged: undefined,
            retired: false,
            dateRetired: undefined,
            retiredBy: undefined,
            retireReason: "",
          },
        })
      );
    });
  });

  it("shows success message and closes overlay on successful submission", async () => {
    (createOrUpdateStockSource as jest.Mock).mockResolvedValue({});
    render(<StockSourcesAddOrUpdate />);

    fireEvent.click(screen.getByText("save"));

    await waitFor(() => {
      expect(showSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: "success",
          title: "addedSource",
        })
      );
      expect(closeOverlay).toHaveBeenCalled();
    });
  });

  it("shows error message on failed submission", async () => {
    const error = new Error("Submission failed");
    (createOrUpdateStockSource as jest.Mock).mockRejectedValue(error);
    render(<StockSourcesAddOrUpdate />);

    fireEvent.click(screen.getByText("save"));

    await waitFor(() => {
      expect(showSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: "error",
          title: "errorAddingSource",
        })
      );
    });
  });

  it("closes overlay when cancel button is clicked", () => {
    render(<StockSourcesAddOrUpdate />);
    fireEvent.click(screen.getByText("cancel"));
    expect(closeOverlay).toHaveBeenCalled();
  });

  it("renders with empty select option initially", () => {
    render(<StockSourcesAddOrUpdate />);
    expect(screen.getByText("chooseSourceType")).toBeInTheDocument();
  });

  it("does not submit form with empty fields", async () => {
    render(<StockSourcesAddOrUpdate />);
    fireEvent.click(screen.getByText("save"));
    await waitFor(() => {
      expect(createOrUpdateStockSource).not.toHaveBeenCalled();
    });
  });

  it("includes uuid when updating existing source", async () => {
    const mockModel: StockSource = {
      uuid: "existing-uuid",
      name: "Existing Source",
      acronym: "ES",
      sourceType: {
        uuid: "type1", display: "Type 1",
        conceptId: 0,
        set: false,
        version: "",
        names: [],
        name: undefined,
        numeric: false,
        complex: false,
        shortNames: [],
        indexTerms: [],
        synonyms: [],
        setMembers: [],
        possibleValues: [],
        preferredName: undefined,
        shortName: undefined,
        fullySpecifiedName: undefined,
        answers: [],
        creator: undefined,
        dateCreated: undefined,
        changedBy: undefined,
        dateChanged: undefined,
        retired: false,
        dateRetired: undefined,
        retiredBy: undefined,
        retireReason: ""
      },
      creator: undefined,
      dateCreated: undefined,
      changedBy: undefined,
      dateChanged: undefined,
      dateVoided: undefined,
      voidedBy: undefined,
      voidReason: "",
      voided: false
    };
    (createOrUpdateStockSource as jest.Mock).mockResolvedValue({});
    render(<StockSourcesAddOrUpdate model={mockModel} />);
  
    fireEvent.click(screen.getByText("save"));
  
    await waitFor(() => {
      expect(createOrUpdateStockSource).toHaveBeenCalledWith(
        expect.objectContaining({
          uuid: "existing-uuid",
          name: "Existing Source",
          acronym: "ES",
        })
      );
    });
  });
});