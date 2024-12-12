import React, { ReactNode, useState } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { User } from '../../core/api/types/identity/User';
import { ComboBox, InlineLoading } from '@carbon/react';
import { useUsersHook } from './users-selector.resource';
import { useDebounce } from '../../core/hooks/debounce-hook';
import { otherUser } from '../../core/utils/utils';
import { useConfig, useSession } from '@openmrs/esm-framework';
import { ConfigObject } from '../../config-schema';

interface UsersSelectorProps<T> {
  placeholder?: string;
  userUuid?: string;
  onUserChanged?: (user: User) => void;
  title?: string;
  invalid?: boolean;
  invalidText?: ReactNode;

  // Control
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
}

const UsersSelector = <T,>(props: UsersSelectorProps<T>) => {
  const { isLoading, userList, setSearchString } = useUsersHook();
  const { user } = useSession();
  const { autoPopulateResponsiblePerson } = useConfig<ConfigObject>();

  const debouncedSearch = useDebounce((query: string) => {
    setSearchString(query);
  }, 1000);

  if (userList) userList.push(otherUser);

  return (
    <div>
      <Controller
        name={props.controllerName}
        control={props.control}
        render={({ field: { onChange, ref } }) => (
          <ComboBox
            disabled={autoPopulateResponsiblePerson ? true : false}
            titleText={props.title}
            name={props.name}
            control={props.control}
            controllerName={props.controllerName}
            id={props.name}
            size={'md'}
            items={userList || []}
            onChange={(data: { selectedItem: User }) => {
              props.onUserChanged?.(data.selectedItem);
              onChange(data.selectedItem?.uuid);
            }}
            initialSelectedItem={
              userList?.find((p) => p.uuid === (autoPopulateResponsiblePerson ? user.uuid : props.userUuid)) ?? ''
            }
            itemToString={userName}
            onInputChange={debouncedSearch}
            placeholder={props.placeholder}
            invalid={props.invalid}
            invalidText={props.invalidText}
            ref={ref}
          />
        )}
      />
      {isLoading && <InlineLoading status="active" iconDescription="Searching" description="Searching..." />}
    </div>
  );
};

function userName(item: User): string {
  return item?.person?.display || '';
}

export default UsersSelector;
