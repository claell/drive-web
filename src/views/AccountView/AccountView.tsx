import React from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import './AccountView.scss';
import AccountBillingTab from './tabs/AccountBillingTab/AccountBillingTab';
import AccountPasswordTab from './tabs/AccountPasswordTab/AccountPasswordTab';
import AccountReferralsTab from './tabs/AccountReferralsTab/AccountReferralsTab';
import AccountSecurityTab from './tabs/AccountSecurityTab/AccountSecurityTab';

const AccountView = (): JSX.Element => {
  return (
    <div className='h-full rounded-md bg-white test pb-16'>
      <Tabs defaultActiveKey="plans" className='relative flex px-8 pt-3.5' >
        <Tab title='Plans' eventKey='plans'>
          <AccountBillingTab />
        </Tab>

        <Tab title='Password' eventKey='password'>
          <AccountPasswordTab />
        </Tab>

        <Tab title='Referrals' eventKey='referrals'>
          <AccountReferralsTab />
        </Tab>

        <Tab title='Security' eventKey='security'>
          <AccountSecurityTab />
        </Tab>

        <Tab title='Business' eventKey='business'>
        </Tab>

        <Tab title='' className='w-full h-full' >
        </Tab>
      </Tabs>
    </div>
  );
};

export default AccountView;