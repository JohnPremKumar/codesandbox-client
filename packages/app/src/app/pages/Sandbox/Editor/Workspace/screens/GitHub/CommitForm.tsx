import {
  Button,
  Radio,
  FormField,
  Input,
  Stack,
  Text,
  Textarea,
} from '@codesandbox/components';
import { useOvermind } from 'app/overmind';
import React, { ChangeEvent, useState } from 'react';

export const CommitForm = () => {
  const [currentAction, setCurrentAction] = useState('branch');
  const {
    actions: {
      git: {
        createPrClicked,
        createCommitClicked,
        titleChanged,
        descriptionChanged,
      },
    },
    state: {
      editor: { currentSandbox, isAllModulesSynced },
      git: {
        description,
        title,
        permission,
        gitChanges,
        isCommitting,
        isCreatingPr,
      },
    },
  } = useOvermind();

  const changeDescription = ({
    target: { value },
  }: ChangeEvent<HTMLTextAreaElement>) => descriptionChanged(value);

  const changeTitle = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
    titleChanged(value);

  const getButtonTitle = (buttonTitle: string) => {
    if (!isAllModulesSynced) {
      return 'Save all files first...';
    }

    return buttonTitle;
  };

  const hasChanges = Boolean(
    gitChanges.added.length ||
      gitChanges.deleted.length ||
      gitChanges.modified.length
  );
  const canUpdate =
    hasChanges && isAllModulesSynced && !isCommitting && !isCreatingPr;

  const evaluatedAction = permission === 'read' ? 'pr' : currentAction;

  if (currentSandbox.prNumber) {
    return (
      <Stack
        as="form"
        direction="vertical"
        gap={1}
        onSubmit={event => event.preventDefault()}
      >
        <FormField direction="vertical" label="Title" hideLabel>
          <Input
            placeholder="Summary (required)"
            onChange={changeTitle}
            value={title}
            disabled={!hasChanges || isCommitting || isCreatingPr}
          />
        </FormField>
        <FormField direction="vertical" label="Description" hideLabel>
          <Textarea
            maxLength={280}
            placeholder="Optional description..."
            onChange={changeDescription}
            value={description}
            disabled={!hasChanges || isCommitting || isCreatingPr}
          />
        </FormField>
        <Stack marginX={2}>
          <Button
            loading={isCommitting}
            variant="primary"
            disabled={!title || !canUpdate}
            onClick={() => createCommitClicked()}
          >
            {getButtonTitle('Commit changes')}
          </Button>
        </Stack>
      </Stack>
    );
  }

  const actions = {
    branch: {
      action: createCommitClicked,
    },
    pr: {
      action: createPrClicked,
    },
  };

  const canCommit = !isCommitting && !isCreatingPr;
  const canCommitDirectly =
    permission === 'write' || (permission === 'admin' && canCommit);

  return (
    <Stack
      as="form"
      direction="vertical"
      gap={1}
      onSubmit={event => event.preventDefault()}
    >
      <FormField direction="vertical" label="Title" hideLabel>
        <Input
          placeholder="Summary (required)"
          onChange={changeTitle}
          value={title}
          disabled={!hasChanges || !canCommit}
        />
      </FormField>
      <FormField direction="vertical" label="Description" hideLabel>
        <Textarea
          maxLength={280}
          placeholder="Optional description..."
          onChange={changeDescription}
          value={description}
          disabled={!hasChanges || !canCommit}
        />
      </FormField>
      <Stack direction="vertical" marginX={2} gap={4}>
        <Stack
          align="flex-start"
          onClick={() => canCommit && setCurrentAction('branch')}
          css={
            canCommitDirectly
              ? {
                  cursor: 'pointer',
                  opacity: 1,
                }
              : {
                  opacity: 0.5,
                }
          }
        >
          <Radio
            checked={evaluatedAction === 'branch'}
            disabled={!canCommitDirectly}
            aria-label="Commit directly to the master branch"
          />{' '}
          <Text>
            <Text variant="muted">Commit directly to the</Text>{' '}
            {currentSandbox.originalGit.branch}
            <Text variant="muted"> branch</Text>
          </Text>
        </Stack>
        <Stack
          align="flex-start"
          onClick={() => canCommit && setCurrentAction('pr')}
          css={
            canCommit
              ? {
                  cursor: 'pointer',
                  opacity: 1,
                }
              : {
                  opacity: 0.5,
                }
          }
        >
          <Radio
            checked={evaluatedAction === 'pr'}
            disabled={!canCommit}
            aria-label={`Create branch csb-${currentSandbox.id} for the commit and start a PR`}
          />{' '}
          <Text>
            <Text variant="muted">Create branch</Text> csb-{currentSandbox.id}
            <Text variant="muted"> for the commit and start a</Text> PR
          </Text>
        </Stack>
        <Stack css={{ width: '100%' }}>
          <Button
            loading={isCommitting || isCreatingPr}
            css={{
              width: '100%',
            }}
            disabled={!title || !canUpdate}
            onClick={() => actions[evaluatedAction].action()}
          >
            {getButtonTitle('Commit changes')}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
