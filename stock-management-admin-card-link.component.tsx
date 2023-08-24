import React from "react";
import { useTranslation } from "react-i18next";
import { Layer, ClickableTile } from "@carbon/react";
import { ArrowRight } from "@carbon/react/icons";

const StockManagementAdminCardLink: React.FC = () => {
  const { t } = useTranslation();
  const header = t("manageForms", "Manage Forms");
  return (
    <Layer>
      <ClickableTile
        href={`${window.spaBase}/stock-management`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div>
          <div className="heading">{header}</div>
          <div className="content">
            {t("stockManagement", "Stock Management")}
          </div>
        </div>
        <div className="iconWrapper">
          <ArrowRight size={16} />
        </div>
      </ClickableTile>
    </Layer>
  );
};

export default StockManagementAdminCardLink;
