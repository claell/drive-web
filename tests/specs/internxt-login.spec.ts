import { test, expect } from '@playwright/test';
import {
  driveTitle,
  wrongLoginText,
  loginPage,
  needHelpPageTitle,
  needHelpText,
  termsAndConditionsText,
  termsOfServiceTitle,
} from '../pages/loginPage';
import { staticData } from '../helper/staticData';
import { accountRecoveryText } from '../pages/loginPage';

test.describe('internxt login', async () => {
  test.beforeEach('Visiting Internxt', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*internxt/);
  });
  test('TC1: Validate that the user can log in successfully', async ({ page }) => {
    const loginpage = new loginPage(page);

    await loginpage.typeEmail(staticData.email);
    await loginpage.typePassword(staticData.password);
    await loginpage.clickLogIn(staticData.password);
    expect(driveTitle).toEqual(staticData.driveTitle);
  });
  test('TC2: Validate that the user cant login with wrong credentials', async ({ page }) => {
    const loginpage = new loginPage(page);
    await loginpage.typeEmail(staticData.email);
    await loginpage.typePassword(staticData.invalidPassword);
    await loginpage.clickLogIn(staticData.invalidPassword);
    expect(wrongLoginText).toEqual(staticData.wrongLoginWarning);
  });
  test('TC3: Validate that the user can go to the “forgot your password” page', async ({ page }) => {
    const loginpage = new loginPage(page);

    await loginpage.clickOnForgotYourPassword();
    expect(accountRecoveryText).toEqual(staticData.accountRecovery);
  });
  test('TC4: Validate that the user can go to the “create account” page', async ({ page }) => {
    const loginpage = new loginPage(page);

    const { dontHaveAccountText, createAccountText, createAccountTitle } = await loginpage.clickOnCreateAccount();
    expect(dontHaveAccountText).toEqual(staticData.dontHaveAccountText);
    expect(createAccountText).toEqual(staticData.createAccountText);
    expect(createAccountTitle).toEqual(staticData.createAccountText);
  });

  test('TC5: Validate that the user can go to the “terms and conditions” page', async ({ page, context }) => {
    const loginpage = new loginPage(page);

    await loginpage.clickOnTermsAndConditions(context);
    expect(termsAndConditionsText).toEqual(staticData.termsAndConditions);
    expect(termsOfServiceTitle).toEqual(staticData.termsOfServiceTitle);
  });

  test('TC6: Validate that the user can go to the “need help” page', async ({ page, context }) => {
    const loginpage = new loginPage(page);

    await loginpage.clickOnNeedHelp(context);
    expect(needHelpText).toEqual(staticData.needHelpLinkText);
    expect(needHelpPageTitle).toEqual(staticData.needHelpTitle);
  });
});
