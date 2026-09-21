import { useEffect, type FC } from 'react';
import { showModal, type DefaultWorkspaceProps } from '@openmrs/esm-framework';
import { useStockTagLocations } from '../stock-lookups/stock-lookups.resource';

const NewLocationWorkspace: FC<DefaultWorkspaceProps> = ({ closeWorkspace }) => {
  const { mutate } = useStockTagLocations();
  useEffect(() => {
    let closed = false;
    const dispose = showModal('stock-create-location-modal', { mutate }, () => {
      if (closed) {
        return;
      }
      closed = true;
      closeWorkspace();
    });
    return () => {
      if (!closed) {
        closed = true;
        dispose();
      }
    };
  }, [closeWorkspace, mutate]);
  return null;
};

export default NewLocationWorkspace;
