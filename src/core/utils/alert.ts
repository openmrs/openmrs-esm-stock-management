import { toErrorMessage } from "./stringUtils";

export const successMessage = (message: string)=>{
    (window as any)["emr"]?.successMessage(message);
}


export const errorMessage = (message: string)=>{
    (window as any)["emr"]?.errorMessage(message);
}

export const alertMessage = (message: string)=>{
    (window as any)["emr"]?.alertMessage(message);
}

export const successAlert = (message: string)=>{
    (window as any)["emr"]?.successAlert(message);
}

export const errorAlert = (message: string)=>{
    (window as any)["emr"]?.errorAlert(message);
}

export const displayErrors = (payload: any) => {
    var errorMessage = toErrorMessage(payload);
    errorAlert(`${errorMessage}`);
    return;
  }