import React, { useEffect } from "react";
import { useStockItemPackageUnitsHook } from "./packaging-units.resource";
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@carbon/react";
import PackagingUnitsConceptSelector from "../packaging-units-concept-selector/packaging-units-concept-selector.component";
import ControlledNumberInput from "../../../core/components/carbon/controlled-number-input/controlled-number-input.component";
import { Save, TrashCan } from "@carbon/react/icons";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PackageUnitFormData, packageUnitSchema } from "./validationSchema";
import { StockItemPackagingUOMDTO } from "../../../core/api/types/stockItem/StockItemPackagingUOM";
import { createStockItemPackagingUnit } from "../../stock-items.resource";
import { showSnackbar } from "@openmrs/esm-framework";

interface PackagingUnitsProps {
  onSubmit?: () => void;
  stockItemUuid: string;
}

const PackagingUnits: React.FC<PackagingUnitsProps> = ({ stockItemUuid }) => {
  const { items, isLoading, tableHeaders, setStockItemUuid } =
    useStockItemPackageUnitsHook();
  useEffect(() => {
    setStockItemUuid(stockItemUuid);
  }, [stockItemUuid, setStockItemUuid]);

  const packageUnitForm = useForm<PackageUnitFormData>({
    defaultValues: {},
    mode: "all",
    resolver: zodResolver(packageUnitSchema),
  });

  const handleSavePackageUnits = () => {
    const { getValues } = packageUnitForm;
    const { factor, packagingUomName, packagingUomUuid } = getValues();
    const payload: StockItemPackagingUOMDTO = {
      factor: factor,
      packagingUomUuid,
      stockItemUuid,
    };
    createStockItemPackagingUnit(payload).then(
      (resp) =>
        showSnackbar({
          title: "Package Unit",
          subtitle: "Package Unit saved successfully",
          kind: "success",
        }),
      (error) => {
        showSnackbar({
          title: "Package Unit",
          subtitle: "Error saving package unit",
          kind: "error",
        });
      }
    );
  };

  if (isLoading)
    return (
      <DataTableSkeleton
        showHeader={false}
        rowCount={5}
        columnCount={5}
        zebra
      />
    );

  return (
    <FormProvider {...packageUnitForm}>
      <DataTable
        rows={items}
        headers={tableHeaders}
        isSortable={false}
        useZebraStyles={true}
        render={({ headers, getHeaderProps, getTableProps }) => (
          <TableContainer>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header: any) => (
                    <TableHeader
                      {...getHeaderProps({
                        header,
                        isSortable: false,
                      })}
                      style={header?.styles}
                      key={`${header.key}`}
                    >
                      {header.header?.content ?? header.header}
                    </TableHeader>
                  ))}
                  <TableHeader style={{ width: "70%" }}></TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length > 0 ? (
                  <>
                    {items.map((row: StockItemPackagingUOMDTO) => {
                      return <PackagingUnitRow row={row} key={row.uuid} />;
                    })}
                  </>
                ) : (
                  <PackagingUnitRow row={{}} key={stockItemUuid} />
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      ></DataTable>
      <Button
        name="save"
        type="submit"
        className="submitButton"
        onClick={handleSavePackageUnits}
        kind="primary"
        renderIcon={Save}
      >
        Save
      </Button>
    </FormProvider>
  );
};

export default PackagingUnits;

const PackagingUnitRow: React.FC<{
  row: StockItemPackagingUOMDTO;
  key?: string;
}> = ({ row, key }) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  errors;
  return (
    <TableRow>
      <TableCell>
        <PackagingUnitsConceptSelector
          controllerName="packagingUomUuid"
          name="packagingUomUuid"
          control={control}
          invalid={!!errors.packagingUomUuid}
          // invalidText={errors?.packagingUomUuid?.message}
        />
      </TableCell>
      <TableCell>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr .5fr",
          }}
        >
          <ControlledNumberInput
            controllerName="factor"
            name="factor"
            control={control}
            id="factor"
            invalid={!!errors.factor}
            // invalidText={errors?.factor?.message}
          />
          <Button
            type="button"
            size="sm"
            className="submitButton clear-padding-margin"
            iconDescription={"Delete"}
            kind="ghost"
            renderIcon={TrashCan}
            onClick={() => {
              //TODO onRemoveItem(row, e);
            }}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};
