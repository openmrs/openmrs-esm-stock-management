import {
    useLocation
} from "react-router-dom";

export const useUrlParams = () => {
    return new URLSearchParams(useLocation().search);
}

export default useUrlParams;
