import * as Yup from 'yup';

const validationSchema = {
    role: Yup.string().required('stockmanagement.userrolescope.validation.rolerequired'),
    isPermanent: Yup.boolean(),
    activeFrom: Yup.date().when("isPermanent", {
        is: false,
        then: Yup.date().required('stockmanagement.userrolescope.validation.activefromrequired').min(Date(), 'stockmanagement.userrolescope.validation.activefromnotinthepast')
    }).nullable(),
    activeTo: Yup.date().when("isPermanent", {
        is: false,
        then: Yup.date().required('stockmanagement.userrolescope.validation.activetorequired').min(Yup.ref('activeFrom'), 'stockmanagement.userrolescope.validation.activetonotbeforeactivefrom')
    }).nullable(),
    operationType: Yup.array().min(1, "stockmanagement.userrolescope.validation.operationtyperequired").of(Yup.string().required()).required("stockmanagement.userrolescope.validation.operationtyperequired"),
    location: Yup.array().min(1, "stockmanagement.userrolescope.validation.locationrequired").of(Yup.string().required()).required("stockmanagement.userrolescope.validation.locationrequired")
};


export const editValidationSchema = Yup.object(validationSchema);
export const createValidationSchema = Yup.object(Object.assign({}, { user: Yup.string().required('stockmanagement.userrolescope.validation.userrequired'), }, validationSchema));