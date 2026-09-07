import { useEffect, type FC } from 'react';
import { showModal, type DefaultWorkspaceProps } from '@openmrs/esm-framework';
import { useSWRConfig } from 'swr';

const NewLocationWorkspace: FC<DefaultWorkspaceProps> = ({ closeWorkspace }) => {
  const { mutate } = useSWRConfig();
  useEffect(() => {
    let closed = false;
    const dispose = showModal('stock-create-location-modal', { mutate }, () => {
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
