import { ConceptFilterCriteria, UserFilterCriteria, useUsers } from '../../stock-lookups/stock-lookups.resource';
import { useEffect, useState } from 'react';
import { ResourceRepresentation } from '../../core/api/api';

export function useUsersHook(filter?: ConceptFilterCriteria) {
  const [conceptFilter, setConceptFilter] = useState<UserFilterCriteria>(
    filter || {
      v: ResourceRepresentation.Default,
      limit: 10,
      startIndex: 0,
    },
  );

  const {
    items: { results: userList },
    isLoading,
  } = useUsers(conceptFilter);

  const [searchString, setSearchString] = useState(null);

  // Drug filter type
  const [limit, setLimit] = useState(filter?.limit || 10);
  const [representation, setRepresentation] = useState(filter?.v || ResourceRepresentation.Default);

  useEffect(() => {
    setConceptFilter({
      startIndex: 0,
      v: representation,
      limit: limit,
      q: searchString,
    });
  }, [searchString, limit, representation]);

  return {
    userList,
    setLimit,
    setRepresentation,
    setSearchString,
    isLoading,
  };
}
