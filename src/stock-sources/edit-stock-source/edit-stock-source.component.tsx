import { Button, Tooltip } from "@carbon/react";
import { Edit } from "@carbon/react/icons";
import { interpolateUrl, navigate } from "@openmrs/esm-framework";

import React, { AnchorHTMLAttributes } from "react";
import { useTranslation } from "react-i18next";

interface NameLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  from: string;
}

const EditSourceActionsMenu: React.FC<NameLinkProps> = ({ from, to }) => {
  const { t } = useTranslation();
  const handleNameClick = (event: MouseEvent, to: string) => {
    event.preventDefault();
    navigate({ to });
    localStorage.setItem("fromPage", from);
  };
  return (
    <Tooltip align="bottom" label="Edit Patient">
      <Button
        kind="ghost"
        onClick={(e) => handleNameClick(e, to)}
        href={interpolateUrl(to)}
        iconDescription={t("editSource", "Edit Source")}
        renderIcon={(props) => <Edit size={16} {...props} />}
      ></Button>
    </Tooltip>
  );
};
export default EditSourceActionsMenu;
