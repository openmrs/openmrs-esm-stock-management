import { Departure24, ListChecked24, Save24, SendFilled24, Undo24 } from '@carbon/icons-react';
import { Button, FormGroup, RadioButton, RadioButtonGroup, RadioButtonValue, TextInput } from "carbon-components-react";
import { produce } from "immer";
import React, { ChangeEvent } from 'react';
import { StockOperationDTO } from "../core/api/types/stockOperation/StockOperationDTO";
import { StockOperationType } from "../core/api/types/stockOperation/StockOperationType";
import useTranslation from '../core/utils/translation';

export interface SubmitApprovalProps {
    model: StockOperationDTO;
    setModel: React.Dispatch<React.SetStateAction<StockOperationDTO>>;
    isNew: boolean;
    locked: boolean;
    currentStockOperationType: StockOperationType | null | undefined;
    canEdit: boolean;
    requiresDispatchAcknowledgement: boolean;
    actions: {
        onGoBack: () => void;
        onSave: () => void;
        onComplete: () => void;
        onSubmit: () => void;
        onDispatch: () => void;
    }
}


export const SubmitApproval: React.FC<SubmitApprovalProps> = ({
    model,
    isNew,
    locked,
    currentStockOperationType,
    canEdit,
    actions,
    setModel,
    requiresDispatchAcknowledgement
}) => {

    const { t } = useTranslation();
    const onApprovalRequiredChange = (selection: RadioButtonValue, name: string, evt: ChangeEvent<HTMLInputElement>) => {
        setModel(
            produce((draft) => {
                draft.approvalRequired = selection === "true";
            })
        );
    }
    return <div className='smt-form'>
        {
            canEdit && !locked && <FormGroup legendText={t("stockmanagement.stockoperation.edit.approvalrequired")} title={t("stockmanagement.stockoperation.edit.approvalrequired")}>
                <RadioButtonGroup name="rbgApprovelRequired" legendText="asdasd asd asd "
                    onChange={onApprovalRequiredChange}
                    defaultSelected={model.approvalRequired == null ? "" : model.approvalRequired.toString().toLowerCase()}>
                    <RadioButton value="true" id="rbgApprovelRequired-true" labelText={t("stockmanagement.yes")} />
                    <RadioButton value="false" id="rbgApprovelRequired-false" labelText={t("stockmanagement.no")} />
                </RadioButtonGroup>
            </FormGroup>
        }
        {
            !canEdit && <>
                <TextInput id="rbgApproveRequiredLbl" value={model.approvalRequired ? t("stockmanagement.yes") : t("stockmanagement.no")} readOnly={true} labelText={t('stockmanagement.stockoperation.edit.approvalrequired')} />
            </>
        }

        {canEdit && !locked && <div className='stkpg-form-buttons'>
            {
                model.approvalRequired != null &&
                <>
                    {!requiresDispatchAcknowledgement && !model.approvalRequired && <Button name="complete" type="button" className="submitButton" kind="primary" onClick={actions.onComplete} renderIcon={ListChecked24}>{t("stockmanagement.stockoperation.edit.complete")}</Button>}
                    {requiresDispatchAcknowledgement && !model.approvalRequired && <Button name="dispatch" type="button" className="submitButton" kind="primary" onClick={actions.onDispatch} renderIcon={Departure24}>{t("stockmanagement.stockoperation.edit.dispatch")}</Button>}
                    {model.approvalRequired && <Button name="submit" type="button" className="submitButton" kind="primary" onClick={actions.onSubmit} renderIcon={SendFilled24}>{t("stockmanagement.stockoperation.edit.submit")}</Button>}
                </>
            }
            <Button name="save" type="button" className="submitButton" onClick={actions.onSave} kind="secondary" renderIcon={Save24}>{t("stockmanagement.save")}</Button>
            <Button type="button" className="cancelButton" kind="tertiary" onClick={actions.onGoBack} renderIcon={Undo24}>{t("stockmanagement.goback")}</Button>
        </div>
        }
    </div>
};