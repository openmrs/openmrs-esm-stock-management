import {
  Button,
  Form,
  ModalBody,
  ModalFooter,
  ModalHeader,
  InlineLoading,
  ComboBox,
} from "@carbon/react";
import React from "react";
import styles from "./create-stock-report.scss";
import { useTranslation } from "react-i18next";
import { closeOverlay } from "../../core/components/overlay/hook";
import { useReportTypes } from "../stock-reports.resource";

interface CreateReportProps {
  model?: ReportModel;
}

export interface ReportModel {
  reportSystemName?: string;
  reportName?: string;
  parameters?: string[];
  date?: Date;
  startDate?: Date;
  endDate?: Date;
  stockItemCategory?: string;
  stockItemCategoryConceptUuid?: string;
  location?: string;
  locationUuid?: string;
  childLocations: boolean;
  stockSourceUuid?: string;
  stockSource?: string;
  stockSourceDestinationUuid?: string;
  stockSourceDestination?: string;
}
const CreateReport: React.FC<CreateReportProps> = ({ model }) => {
  const { t } = useTranslation();

  const { reportTypes, isLoading } = useReportTypes();
  if (isLoading) {
    return (
      <InlineLoading
        status="active"
        iconDescription="Loading"
        description="Loading data..."
      />
    );
  }

  return (
    <div>
      <Form>
        <ModalHeader />
        <ModalBody>
          <section className={styles.section}>
            <div>
              <>
                <span className={styles.subTitle}>{t("report", "Report")}</span>
                <ComboBox
                  id="report"
                  size="md"
                  labelText={t("reportName", "Report")}
                  items={reportTypes ?? []}
                  itemToString={(item) => `${item?.name ?? item?.name ?? ""}`}
                  placeholder="Filter..."
                />
              </>
            </div>
          </section>
          <br />
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={closeOverlay}>
            {t("cancel", "Cancel")}
          </Button>
          <Button type="submit">{t("continue", "Continue")}</Button>
        </ModalFooter>
      </Form>
    </div>
  );
};

export default CreateReport;
