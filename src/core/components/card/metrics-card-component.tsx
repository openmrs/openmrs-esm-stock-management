import React from "react";
import { useTranslation } from "react-i18next";
import { Tile } from "@carbon/react";
import { ArrowRight } from "@carbon/react/icons";
import styles from "./metrics-card.scss";
import { ConfigurableLink } from "@openmrs/esm-framework";
import isEmpty from "lodash-es/isEmpty";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);

interface MetricsCardProps {
  label: string;
  value: number;
  headerLabel: string;
  children?: React.ReactNode;
  view: string;
  count?: { expiry7days: Array<any>; expiry30days: Array<any> };
  outofstockCount?: { itemsbelowmin: Array<any>; itemsabovemax: Array<any> };
  disposedCount?: { expired: Array<any>; poorquality: Array<any> };
}
const MetricsCard: React.FC<MetricsCardProps> = ({
  label,
  value,
  headerLabel,
  children,
  view,
  count,
  outofstockCount,
  disposedCount,
}) => {
  const { t } = useTranslation();

  return (
    <Tile className={styles.tileContainer}>
      <div className={styles.tileHeader}>
        <div className={styles.headerLabelContainer}>
          <label className={styles.headerLabel}>{headerLabel}</label>
          {children}
        </div>
        {view && (
          <ConfigurableLink
            className={styles.link}
            to={`\${openmrsSpaBase}/stock-management/orders`}
          >
            <span style={{ fontSize: "0.825rem", marginRight: "0.325rem" }}>
              {t("view", "View")}
            </span>{" "}
            <ArrowRight size={16} className={styles.viewListBtn} />
          </ConfigurableLink>
        )}
      </div>
      <div className={styles.metricsGrid}>
        <div>
          <label className={styles.totalsLabel}>{label}</label>
          <p className={styles.totalsValue}>{value}</p>
        </div>
        {!isEmpty(count) && (
          <div className={styles.countGrid}>
            <span style={{ color: "#DA1E28" }}>
              {t("in7days", "In 7 days")}
            </span>
            <span style={{ color: " #FABA5F" }}>
              {t("in30days", "In 30 days")}
            </span>
            <p style={{ color: "#DA1E28" }}>{count.expiry7days?.length}</p>
            <p style={{ color: "#FABA5F" }}>{count.expiry30days?.length}</p>
          </div>
        )}
        {!isEmpty(outofstockCount) && (
          <div className={styles.countGrid}>
            <span style={{ color: "#DA1E28" }}>
              {t("itemsbelowmin", "Items Below Min")}
            </span>
            <span style={{ color: "#319227" }}>
              {t("itemsabovemax", "Items Above Max")}
            </span>
            <p style={{ color: "#DA1E28" }}>
              {outofstockCount.itemsbelowmin?.length}
            </p>
            <p style={{ color: "#319227" }}>
              {outofstockCount.itemsabovemax?.length}
            </p>
          </div>
        )}
        {!isEmpty(disposedCount) && (
          <div className={styles.countGrid}>
            <span style={{ color: "#DA1E28" }}>{t("expired", "Expired")}</span>
            <span style={{ color: "#FABA5F" }}>
              {t("poorquality", "Poor Quality")}
            </span>
            <p style={{ color: "#DA1E28" }}>{disposedCount.expired?.length}</p>
            <p style={{ color: "#FABA5F" }}>
              {disposedCount.poorquality?.length}
            </p>
          </div>
        )}
      </div>
    </Tile>
  );
};
export default MetricsCard;
