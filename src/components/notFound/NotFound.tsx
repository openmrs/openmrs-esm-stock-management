import * as React from "react";
import { Navigate } from "react-router-dom";
import { URL_STOCK_HOME } from "../../constants";
import useTranslation from "../../core/utils/translation";
import "./NotFound.css";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="center-block">
      <div className="text-center">
        <h1>404</h1>
        <h2>{t("stockmanagement.notfound.title")}</h2>
        <h3>{t("stockmanagement.accessdenied.description")}</h3>
        <button
          className="btn btn-primary"
          style={{ backgroundImage: "none" }}
          onClick={() => <Navigate to={URL_STOCK_HOME} />}
        >
          {t("stockmanagement.notfound.returnhome")}
        </button>
      </div>
    </div>
  );
}
