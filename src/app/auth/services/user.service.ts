import { UserSettings } from '@internxt/sdk/dist/shared/types/userSettings';
import { SdkFactory } from '../../core/factory/sdk';
import {
  CheckChangeEmailExpirationResponse,
  FriendInvite,
  InitializeUserResponse,
  PreCreateUserResponse,
  UpdateProfilePayload,
  UserPublicKeyResponse,
  VerifyEmailChangeResponse,
} from '@internxt/sdk/dist/drive/users/types';

export async function initializeUser(email: string, mnemonic: string): Promise<InitializeUserResponse> {
  const usersClient = SdkFactory.getInstance().createUsersClient();
  return usersClient.initialize(email, mnemonic);
}

export const sendDeactivationEmail = (email: string): Promise<void> => {
  const authClient = SdkFactory.getInstance().createAuthClient();
  return authClient.sendDeactivationEmail(email);
};

const inviteAFriend = (email: string): Promise<void> => {
  const usersClient = SdkFactory.getInstance().createUsersClient();
  return usersClient.sendInvitation(email);
};

const preCreateUser = (email: string): Promise<PreCreateUserResponse> => {
  const usersClient = SdkFactory.getNewApiInstance().createNewUsersClient();
  return usersClient.preRegister(email);
};

/**
 * ! This endpoint accepts a body but is using GET method
 */
const refreshUser = async (): Promise<{ user: UserSettings; token: string }> => {
  const usersClient = SdkFactory.getInstance().createUsersClient();
  return usersClient.refreshUser();
};

const updateUserProfile = (payload: Required<UpdateProfilePayload>): Promise<void> => {
  const usersClient = SdkFactory.getInstance().createUsersClient();
  return usersClient.updateProfile(payload);
};

const getFriendInvites = (): Promise<FriendInvite[]> => {
  const usersClient = SdkFactory.getInstance().createUsersClient();
  return usersClient.getFriendInvites();
};

const updateUserAvatar = (payload: { avatar: Blob }): Promise<{ avatar: string }> => {
  const usersClient = SdkFactory.getInstance().createUsersClient();
  return usersClient.updateAvatar(payload);
};

const deleteUserAvatar = (): Promise<void> => {
  const usersClient = SdkFactory.getInstance().createUsersClient();
  return usersClient.deleteAvatar();
};

const sendVerificationEmail = (): Promise<void> => {
  const usersClient = SdkFactory.getInstance().createUsersClient();
  return usersClient.sendVerificationEmail();
};

const getPublicKeyByEmail = (email: string): Promise<UserPublicKeyResponse> => {
  const usersClient = SdkFactory.getNewApiInstance().createNewUsersClient();
  return usersClient.getPublicKeyByEmail({ email });
};

const changeEmail = (newEmail: string): Promise<void> => {
  const authClient = SdkFactory.getNewApiInstance().createNewUsersClient();
  return authClient.changeUserEmail(newEmail);
};

const verifyEmailChange = (verifyToken: string): Promise<VerifyEmailChangeResponse> => {
  const authClient = SdkFactory.getNewApiInstance().createNewUsersClient();
  return authClient.verifyEmailChange(verifyToken);
};

const checkChangeEmailLinkExpiration = (verifyToken: string): Promise<CheckChangeEmailExpirationResponse> => {
  const authClient = SdkFactory.getNewApiInstance().createNewUsersClient();
  return authClient.checkChangeEmailExpiration(verifyToken);
};

const userService = {
  initializeUser,
  refreshUser,
  sendDeactivationEmail,
  inviteAFriend,
  updateUserProfile,
  getFriendInvites,
  updateUserAvatar,
  deleteUserAvatar,
  sendVerificationEmail,
  getPublicKeyByEmail,
  changeEmail,
  verifyEmailChange,
  checkChangeEmailLinkExpiration,
  preCreateUser,
};

export default userService;
