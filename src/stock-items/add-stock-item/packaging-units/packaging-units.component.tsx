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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PackageUnitFormData, packageUnitSchema } from "./validationSchema";
import { StockItemPackagingUOMDTO } from "../../../core/api/types/stockItem/StockItemPackagingUOM";

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
    <>
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
                {items.map((row: StockItemPackagingUOMDTO) => {
                  return <PackagingUnitRow row={row} key={row.uuid} />;
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      ></DataTable>
      <Button
        name="save"
        type="submit"
        className="submitButton"
        onClick={() => {
          // TODO: Implement Save
        }}
        kind="primary"
        renderIcon={Save}
      >
        Save
      </Button>
    </>
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
  } = useForm<PackageUnitFormData>({
    defaultValues: row,
    mode: "all",
    resolver: zodResolver(packageUnitSchema),
  });

  return (
    <TableRow key={key}>
      <TableCell>
        <PackagingUnitsConceptSelector
          controllerName="packagingUomUuid"
          name="packagingUomUuid"
          control={control}
          invalid={!!errors.packagingUomUuid}
          invalidText={errors?.packagingUomUuid?.message}
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
            invalidText={errors?.factor?.message}
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
