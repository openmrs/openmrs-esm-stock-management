export interface ImportResult{
    createdCount: number;	
	updatedCount: number;	
	uploadSessionId: string;	
	hasErrorFile: boolean;	
	success: boolean;	
	errors: string[];	
	exception: any;
	notChangedCount: number;
}