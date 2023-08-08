import { resolvePath, useLocation } from "react-router-dom";
import { REACT_ROUTER_PREFIX, STOCKMGMT_SPA_PAGE_URL } from "../../constants";

export const resolveRouterPath = (path: string): string => {
  return `${STOCKMGMT_SPA_PAGE_URL}${REACT_ROUTER_PREFIX}${
    resolvePath(path)?.pathname
  }`;
};

export const useUrlQueryParams = () => {
  return new URLSearchParams(useLocation().search);
};
