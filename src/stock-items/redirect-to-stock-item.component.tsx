import { AccordionSkeleton } from "@carbon/react";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { URL_STOCK_ITEM, URL_STOCK_ITEMS } from "../constants";
import { useUrlQueryParams } from "../core/utils/urlUtils";

const RedirectToStockItem = () => {
  const { id } = useParams();
  const urlQueryParams = useUrlQueryParams();
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      if (id) {
        navigate(
          URL_STOCK_ITEM(
            id,
            (urlQueryParams.get("tab") ?? "0") + "&_t=" + new Date().getTime()
          )
        );
      } else {
        navigate(URL_STOCK_ITEMS);
      }
    }, 500);
  }, [id, navigate, urlQueryParams]);
  return (
    <>
      <AccordionSkeleton open count={4} />
    </>
  );
};

export default RedirectToStockItem;
