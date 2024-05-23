import { WorkspaceUser } from '@internxt/sdk/dist/workspaces';

const searchMembers = (membersList: WorkspaceUser[] | null, searchString: string) => {
  const escapedSearchString = searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedSearchString, 'i');

  const resultados = membersList?.filter((obj) => {
    const fullName = obj.member.name + ' ' + obj.member.lastname;
    return regex.test(fullName);
  });

  return resultados || [];
};

const getMemberRole = (member: WorkspaceUser) => {
  let role;
  const isOwner = member.isOwner;
  const isManager = member.isManager;
  const isDeactivated = member.deactivated;

  isOwner && isManager && (role = 'owner');
  !isOwner && isManager && (role = 'manager');
  isDeactivated && (role = 'deactivated');

  return role;
};

export { getMemberRole, searchMembers };
