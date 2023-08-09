import { AccordionSkeleton } from "@carbon/react";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { URL_STOCK_OPERATION, URL_STOCK_OPERATIONS } from "../constants";
import { useUrlQueryParams } from "../core/utils/urlUtils";

const RedirectToStockOperation = () => {
  const { id } = useParams();
  const urlQueryParams = useUrlQueryParams();
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      if (id) {
        navigate(
          URL_STOCK_OPERATION(
            id,
            (urlQueryParams.get("tab") ?? "0") + "&_t=" + new Date().getTime()
          )
        );
      } else {
        navigate(URL_STOCK_OPERATIONS);
      }
    }, 500);
  }, [id, navigate, urlQueryParams]);
  return (
    <>
      <AccordionSkeleton open count={4} />
    </>
  );
};

export default RedirectToStockOperation;
