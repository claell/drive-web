import { IconProps } from '@phosphor-icons/react';
import { ReactNode } from 'react';
import { matchPath, NavLink } from 'react-router-dom';
import { useTranslationContext } from 'app/i18n/provider/TranslationProvider';

interface SidenavItemProps {
  label: string;
  showNew?: boolean;
  notifications?: number;
  to?: string;
  Icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;
  onClick?: () => void;
  iconDataCy?: string;
}

const SidenavItem = ({
  label,
  to,
  Icon,
  onClick,
  showNew,
  notifications,
  iconDataCy,
}: SidenavItemProps): JSX.Element => {
  const isActive = !!matchPath(window.location.pathname, { path: to, exact: true });

  const { translate } = useTranslationContext();

  const content: ReactNode = (
    <div className="flex h-10 w-full items-center justify-between">
      <div className="flex items-center">
        <Icon
          weight={isActive ? 'fill' : undefined}
          size={24}
          data-cy={iconDataCy}
          className={isActive ? 'text-primary' : 'text-gray-80'}
        />
        <span className={`ml-2 ${isActive ? 'text-primary dark:text-white' : 'text-gray-80 hover:text-gray-80'}`}>
          {label}
        </span>
      </div>
      {showNew && (
        <div className="h-5 rounded-full bg-primary px-2.5 text-xs font-medium uppercase text-white">
          <p className="leading-5">{translate('general.new')}</p>
        </div>
      )}
      {!!notifications && (
        <div className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs text-white">
          <span>{notifications}</span>
        </div>
      )}
    </div>
  );

  onClick = onClick || (() => undefined);

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg pl-6 pr-3 font-medium ${
        isActive ? 'bg-primary/10 dark:bg-primary/20' : 'hover:bg-gray-1 active:bg-gray-5'
      }`}
    >
      {to ? (
        <NavLink className="no-underline" exact to={to}>
          {content}
        </NavLink>
      ) : (
        content
      )}
    </div>
  );
};

export default SidenavItem;
