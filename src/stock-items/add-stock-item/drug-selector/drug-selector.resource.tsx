import { ResourceRepresentation } from "../../../core/api/api";
import { useEffect, useState } from "react";
import {
  ConceptFilterCriteria,
  useDrugs,
} from "../../../stock-lookups/stock-lookups.resource";
import { debounce } from "../../../core/utils/debounce";

export function useDrugsHook(filter?: ConceptFilterCriteria) {
  const [conceptFilter, setConceptFilter] = useState<ConceptFilterCriteria>(
    filter || {
      v: ResourceRepresentation.Default,
      startIndex: 0,
    }
  );

  const {
    items: { results: drugList },
    isLoading,
  } = useDrugs(conceptFilter);

  const [searchString, setSearchString] = useState("");

  // Drug filter type
  const [limit, setLimit] = useState(filter?.limit || 10);
  const [representation, setRepresentation] = useState(
    filter?.v || ResourceRepresentation.Default
  );

  useEffect(() => {
    debounce(
      () =>
        setConceptFilter({
          startIndex: 0,
          v: representation,
          limit: limit,
          q: searchString,
        }),
      500
    );
  }, [searchString, limit, representation]);

  return {
    drugList,
    setLimit,
    setRepresentation,
    setSearchString,
    isLoading,
  };
}
