import { Save24, Undo24 } from "@carbon/icons-react";
import { Button } from "carbon-components-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Splash } from "../components/spinner/Splash";
import {
  URL_STOCK_HOME,
  URL_USER_ROLE_SCOPE,
  URL_USER_ROLE_SCOPES,
  URL_USER_ROLE_SCOPES_NEW,
} from "../constants";
import { UserRoleScope } from "../core/api/types/identity/UserRoleScope";
import {
  useCreateOrUpdateUserRoleScopeMutation,
  useLazyGetUserRoleScopeQuery,
} from "../core/api/userRoleScope";
import { errorAlert, successAlert } from "../core/utils/alert";
import { BreadCrumbs } from "../core/utils/breadCrumbs";
import { toErrorMessage } from "../core/utils/stringUtils";
import useTranslation from "../core/utils/translation";
import { EditUserScope } from "./edit-user-scope.component";

export const Edit = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [validateForm, setValidateForm] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [createOrUpdateUserRoleScope] =
    useCreateOrUpdateUserRoleScopeMutation();
  const [editableModel, setEditableMode] = useState<UserRoleScope>({
    permanent: true,
    enabled: true,
    locations: [],
    operationTypes: [],
  } as unknown as UserRoleScope);
  const navigate = useNavigate();
  const [formLoaded, setFormLoaded] = useState(false);
  const [
    getUserRoleScope,
    { isFetching: isFetchingUserRoleScope, data: loadedUserRoleScope },
  ] = useLazyGetUserRoleScopeQuery();

  const isNew = useMemo(() => {
    console.log(id);
    return null === id || id === undefined;
  }, [id]);

  useEffect(() => {
    if (!isNew && !isFetchingUserRoleScope && loadedUserRoleScope) {
      setEditableMode(loadedUserRoleScope);
    }
  }, [loadedUserRoleScope, isFetchingUserRoleScope, isNew]);

  useEffect(() => {
    if (!isNew && id !== null && id !== undefined) {
      getUserRoleScope(id);
    }
  }, [getUserRoleScope, id, isNew]);

  useEffect(() => {
    let breadCrubs = new BreadCrumbs()
      .withHome()
      .withLabel(t("stockmanagement.dashboard.title"), URL_STOCK_HOME)
      .withLabel(
        t("stockmanagement.userrolescope.list.title"),
        URL_USER_ROLE_SCOPES
      );
    if (isNew) {
      breadCrubs.withLabel(
        t("stockmanagement.userrolescope.new.title"),
        URL_USER_ROLE_SCOPES_NEW
      );
    } else {
      breadCrubs.withLabel(
        `${loadedUserRoleScope?.userFamilyName} ${loadedUserRoleScope?.userGivenName}`,
        URL_USER_ROLE_SCOPE(id!)
      );
    }
    breadCrubs.generateBreadcrumbHtml();
  }, [t, loadedUserRoleScope, id, isNew]);

  function onValidationComplete(
    isSuccess: boolean,
    updatedModel: UserRoleScope
  ) {
    setValidateForm(false);
    if (isSuccess) {
      try {
        setShowSplash(true);
        createOrUpdateUserRoleScope(updatedModel)
          .unwrap()
          .then((payload: any) => {
            if ((payload as any).error) {
              var errorMessage = toErrorMessage(payload);
              errorAlert(
                `${t(
                  updatedModel.uuid == null
                    ? "stockmanagement.userrolescope.createfailed"
                    : "stockmanagement.userrolescope.updatefailed"
                )} ${errorMessage}`
              );
              return;
            } else {
              successAlert(
                `${t(
                  updatedModel.uuid == null
                    ? "stockmanagement.userrolescope.createsuccess"
                    : "stockmanagement.userrolescope.updatesuccess"
                )}`
              );
              navigate(URL_USER_ROLE_SCOPES);
            }
          })
          .catch((error) => {
            var errorMessage = toErrorMessage(error);
            errorAlert(
              `${t(
                "stockmanagement.userrolescope.updatefailed"
              )} ${errorMessage}`
            );
            return;
          });
      } finally {
        setShowSplash(false);
      }
    }
  }

  const onCancel = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    navigate("URL_USER_ROLE_SCOPES");
  };

  const onSave = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setValidateForm(true);
  };

  const onFormLoading = (isLoading: boolean): void => {
    setFormLoaded(!isLoading);
  };

  return (
    <>
      <Splash active={showSplash} blockUi={false} />
      <div className="stkpg-page">
        <div className="stkpg-page-header">
          <h1 className="stkpg-page-title">
            <strong>
              {t(
                isNew
                  ? "stockmanagement.userrolescope.new.title"
                  : "stockmanagement.userrolescope.edit.title"
              )}
            </strong>
          </h1>
          <h3 className="stkpg-page-subtitle">
            {formLoaded && !isNew && (
              <>
                {`${loadedUserRoleScope?.userFamilyName} ${loadedUserRoleScope?.userGivenName}`}
                , <small>{loadedUserRoleScope?.role}</small>
              </>
            )}
            {isNew && t("stockmanagement.userrolescope.list.header.role")}
          </h3>
        </div>
        <div className="stkpg-page-body">
          {!isNew && isFetchingUserRoleScope && <Splash active={true} />}
          {(isNew ||
            (editableModel?.uuid &&
              id !== null &&
              id !== undefined &&
              !isFetchingUserRoleScope &&
              loadedUserRoleScope)) && (
            <>
              <EditUserScope
                model={editableModel!}
                onFormLoading={onFormLoading}
                isNew={isNew}
                validateForm={validateForm}
                onValidationComplete={onValidationComplete}
              />
              {formLoaded && (
                <div className="stkpg-form-buttons">
                  <Button
                    type="button"
                    className="submitButton"
                    kind="primary"
                    onClick={onSave}
                    renderIcon={Save24}
                  >
                    Save Scope
                  </Button>
                  <Button
                    type="button"
                    className="cancelButton"
                    kind="tertiary"
                    onClick={onCancel}
                    renderIcon={Undo24}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};
