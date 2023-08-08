import { RecordPermission } from "./RecordPermission";

export interface BatchJobOwner {
    uuid?: string;
    batchJobUuid?: string;
    ownerUserUuid?: string;
    ownerGivenName?: string;
    ownerFamilyName?: string;
    dateCreated?: Date;
}

export interface BatchJob {
    uuid: string;
    batchJobType?: string;
    status?: string;
    description?: string;
    startTime?: Date;
    endTime?: Date;
    expiration?: Date;
    parameters?: string;
    privilegeScope?: string;
    locationScope?: string;
    locationScopeUuid?: string;
    executionState?: string;
    cancelReason?: string;
    cancelledByUuid?: string;
    cancelledByGivenName?: string;
    cancelledByFamilyName?: string;
    cancelledDate?: Date;
    exitMessage?: string;
    completedDate?: Date;
    dateCreated?: Date;
    creatorUuid?: string;
    creatorGivenName?: string;
    creatorFamilyName?: string;
    voided?: boolean;
    outputArtifactSize?: number;
    outputArtifactFileExt?: string;
    outputArtifactViewable?: boolean;
    owners?: BatchJobOwner[];
    permission: RecordPermission | null | undefined;
}

export const BatchJobTypeReport = "Report";
export const BatchJobTypeOther = "Other";

export const BatchJobTypes = [BatchJobTypeReport, BatchJobTypeOther] as const;
export type BatchJobType = typeof BatchJobTypes[number];

export const BatchJobStatusPending = "Pending";
export const BatchJobStatusRunning = "Running";
export const BatchJobStatusFailed = "Failed";
export const BatchJobStatusCompleted = "Completed";
export const BatchJobStatusCancelled = "Cancelled";
export const BatchJobStatusExpired = "Expired";

export const BatchJobStatuses = [BatchJobStatusPending, BatchJobStatusRunning, BatchJobStatusFailed, BatchJobStatusCompleted, BatchJobStatusCancelled, BatchJobStatusExpired] as const;
export type BatchJobStatus = typeof BatchJobStatuses[number];

export const isBatchJobStillActive = (status: string | undefined | null): boolean => status === BatchJobStatusPending || status === BatchJobStatusRunning;

export const parseParametersToMap = (parameters: string | undefined | null, ignoreLines: string[] = []): { [key: string]: { [key: string]: string } } | null => {
    if (!parameters) {
        return null;
    }
    let result: { [key: string]: { [key: string]: string } } = {};
    const re = /\r?\n|\r/;
    let lines = parameters.split(re);
    lines.forEach(line => {
        if (line.startsWith("#") || (ignoreLines && ignoreLines.some(p => line.startsWith(p))))
            return;
        let tokens = line.split("=", 2);
        if (tokens.length !== 2) return;
        if (tokens[0].startsWith("param.")) {
            let nameToken = tokens[0].substring(6);
            let valueDescIndex = nameToken.lastIndexOf(".value.desc");
            if (valueDescIndex > 0) {
                nameToken = nameToken.substring(0, valueDescIndex) + ".display";
            }
            if (nameToken) {
                let nameParts = nameToken.split(".");
                let name: string = nameParts.length > 1 ? nameParts.slice(0, nameParts.length - 1).join(".") : nameParts[0];
                let nameProperty: string = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "value";
                if (!result[name]) {
                    result[name] = {};
                }
                result[name][nameProperty] = tokens[1];
            }
        } else {
            let nameParts = tokens[0].split(".", 2);
            let name: string = nameParts[0];
            let nameProperty: string = nameParts.length > 1 ? nameParts[1] : "value";
            if (!result[name]) {
                result[name] = {};
            }
            result[name][nameProperty] = tokens[1];
        }
    })
    return result;
}