import { BASE_OPENMRS_APP_URL } from "../../constants";
import { resolveRouterPath } from "../../core/utils/urlUtils";

export interface BreadCrumb {
  icon: string | null;
  link: string | null;
  label: string | null;
}

export class BreadCrumbs {
  private breadCrumbs: Array<BreadCrumb> | null;
  constructor() {
    this.breadCrumbs = new Array<BreadCrumb>();
  }

  public withHome(): BreadCrumbs {
    var breadCrumb: BreadCrumb = {
      icon: "icon-home",
      link: BASE_OPENMRS_APP_URL + "index.htm",
      label: null,
    };
    this.breadCrumbs?.push(breadCrumb);
    return this;
  }

  public withIcon(icon: string, link: string): BreadCrumbs {
    var breadCrumb: BreadCrumb = {
      icon: icon,
      link: resolveRouterPath(link),
      label: null,
    };
    this.breadCrumbs?.push(breadCrumb);
    return this;
  }

  public withLabel(label: string, link: string | null): BreadCrumbs {
    var breadCrumb: BreadCrumb = {
      icon: null,
      link: link == null ? null : resolveRouterPath(link),
      label: label,
    };
    this.breadCrumbs?.push(breadCrumb);
    return this;
  }

  public clearBreadCrumbs(): BreadCrumbs {
    (window as any)["jQuery"]?.("#breadcrumbs")?.html("");
    return this;
  }

  public generateBreadcrumbHtml(): void {
    if (this.breadCrumbs && this.breadCrumbs.length > 0) {
      (window as any)
        ["jQuery"]?.("#breadcrumbs")
        ?.html(
          (window as any)["emr"]?.generateBreadcrumbHtml(this.breadCrumbs)
        );
    }
  }
}
