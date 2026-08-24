import React, { useMemo } from 'react';
import { ConfigurableLink, useSession } from '@openmrs/esm-framework';
import { BrowserRouter, useLocation } from 'react-router-dom';

export interface DashboardLinkConfig {
  name: string;
  title: string;
  requiredRoleUuid?: string;
}

function DashboardExtension({ dashboardLinkConfig }: { dashboardLinkConfig: DashboardLinkConfig }) {
  const { name, title, requiredRoleUuid } = dashboardLinkConfig;
  const location = useLocation();
  const { user } = useSession();
  const spaBasePath = `${window.spaBase}/stock-management`;

  const navLink = useMemo(() => {
    const pathArray = location.pathname.split('/');
    const lastElement = pathArray[pathArray.length - 1];
    return decodeURIComponent(lastElement);
  }, [location.pathname]);

  if (requiredRoleUuid && !user?.roles.some((role) => role.uuid === requiredRoleUuid)) {
    return null;
  }

  return (
    <ConfigurableLink
      to={`${spaBasePath}/${name}`}
      className={`cds--side-nav__link ${navLink.match(name) && 'active-left-nav-link'}`}
    >
      {title}
    </ConfigurableLink>
  );
}

export const createDashboardLink = (dashboardLinkConfig: DashboardLinkConfig) => () =>
  (
    <BrowserRouter>
      <DashboardExtension dashboardLinkConfig={dashboardLinkConfig} />
    </BrowserRouter>
  );
