export function ClickElement(selector: any){
    (window as any)["jQuery"]?.(selector)?.click();
}