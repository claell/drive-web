import UilAngleUp from '@iconscout/react-unicons/icons/uil-angle-up';
import UilAngleDown from '@iconscout/react-unicons/icons/uil-angle-down';

import i18n from 'app/i18n/services/i18n.service';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { uiActions } from 'app/store/slices/ui';

import './ReferralsWidget.scss';

const ReferralsWidget = () => {
  const dispatch = useAppDispatch();
  const isCollapsed = useAppSelector((state) => state.ui.isReferralsWidgetCollapsed);
  const setIsCollapsed = (value) => dispatch(uiActions.setIsReferralsWidgetCollapsed(value));
  const referrals = useAppSelector((state) => state.referrals.list);
  const creditSum = referrals.reduce((t, x) => t + x.credit, 0);
  const referralsList = referrals.map((referral) => (
    <div key={referral.id} className="referral-item flex items-center mb-4">
      <div className="referral-item-bullet flex-none h-4 w-8 py-1 px-2 text-xs rounded-lg bg-l-neutral-30 flex justify-center items-center mr-2">
        <span>{`${referral.credit}GB`}</span>
      </div>
      <span className="text-neutral-500 text-sm">
        {i18n.get(`referrals.items.${referral.key}`, {
          steps: referral.steps,
          completedSteps: referral.completedSteps,
        })}
      </span>
    </div>
  ));
  const onCollapseButtonClicked = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="p-6 border-t border-b border-l-neutral-30 bg-l-neutral-10">
      {/* HEADER */}
      <div className="flex items-center">
        <div className="mr-3">
          <span className="font-semibold">{i18n.get('referrals.rewards.title', { creditSum })}</span>
          <p className="text-supporting-2 m-0">
            <span className="text-green-50">{i18n.get('referrals.rewards.progress', { progress: 0 })}</span>
            <span className="text-neutral-500">{' ' + i18n.get('referrals.rewards.limit', { creditSum })}</span>
          </p>
        </div>
        <div className="flex-none rounded-1/2 bg-l-neutral-30 w-4 h-4 cursor-pointer" onClick={onCollapseButtonClicked}>
          {isCollapsed ? (
            <UilAngleDown className="text-m-neutral-100 w-full h-full" />
          ) : (
            <UilAngleUp className="text-m-neutral-100 w-full h-full" />
          )}
        </div>
      </div>

      {/* LIST */}
      {!isCollapsed && <div className="mt-8 mb-4">{referralsList}</div>}

      {/* TERMS AND CONDITIONS */}
      {!isCollapsed && (
        <div>
          <a
            className="text-xs text-m-neutral-60 hover:text-m-neutral-100"
            target="_blank"
            href="https://help.internxt.com/"
            rel="noopener noreferrer"
          >
            {i18n.get('actions.moreInfo')}
          </a>
        </div>
      )}
    </div>
  );
};

export default ReferralsWidget;
