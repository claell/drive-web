import React, { ReactNode } from 'react';
import UilArrowDown from '@iconscout/react-unicons/icons/uil-arrow-down';
import UilArrowUp from '@iconscout/react-unicons/icons/uil-arrow-up';
import { connect } from 'react-redux';

import DriveExplorerListItem from '../DriveExplorerItem/DriveExplorerListItem/DriveExplorerListItem';
import { AppDispatch, RootState } from '../../../../store';
import { storageActions } from '../../../../store/slices/storage';
import { DriveItemData } from '../../../types';
import { OrderDirection, OrderSettings } from '../../../../core/types';
import DriveListItemSkeleton from '../../DriveListItemSkeleton/DriveListItemSkeleton';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useTranslation } from 'react-i18next';

interface DriveExplorerListProps {
  isLoading: boolean;
  items: DriveItemData[];
  selectedItems: DriveItemData[];
  order: OrderSettings;
  dispatch: AppDispatch;
  onEndOfScroll(): void;
  hasMoreItems: boolean;
  isTrash?: boolean;
}

const DriveExplorerList = (props: DriveExplorerListProps) => {
  const { t } = useTranslation();
  function hasItems(): boolean {
    return props.items.length > 0;
  }

  function itemsList(): JSX.Element[] {
    return props.items.map((item: DriveItemData) => {
      const itemParentId = item.parentId || item.folderId;
      const itemKey = `${item.isFolder ? 'folder' : 'file'}-${item.id}-${itemParentId}`;

      return <DriveExplorerListItem isTrash={props.isTrash} key={itemKey} item={item} />;
    });
  }

  function itemsFileList(): JSX.Element[] {
    return props.items
      .filter((item) => !item.isFolder)
      .map((item: DriveItemData) => {
        const itemParentId = item.parentId || item.folderId;
        const itemKey = `'file'-${item.id}-${itemParentId}`;

        return <DriveExplorerListItem key={itemKey} item={item} isTrash={props.isTrash} />;
      });
  }

  function itemsFolderList(): JSX.Element[] {
    return props.items
      .filter((item) => item.isFolder)
      .map((item: DriveItemData) => {
        const itemParentId = item.parentId || item.folderId;
        const itemKey = `'folder'-${item.id}-${itemParentId}`;

        return <DriveExplorerListItem key={itemKey} item={item} isTrash={props.isTrash} />;
      });
  }

  function isAllSelected(): boolean {
    const { selectedItems, items } = props;

    return selectedItems.length === items.length && items.length > 0;
  }

  function loadingSkeleton(): JSX.Element[] {
    return Array(20)
      .fill(0)
      .map((n, i) => <DriveListItemSkeleton key={i} />);
  }

  const onSelectAllButtonClicked = () => {
    const { dispatch, items } = props;

    isAllSelected() ? dispatch(storageActions.clearSelectedItems()) : dispatch(storageActions.selectItems(items));
  };

  const { dispatch, isLoading, order, hasMoreItems, onEndOfScroll } = props;

  const sortBy = (orderBy: string) => {
    const direction =
      order.by === orderBy
        ? order.direction === OrderDirection.Desc
          ? OrderDirection.Asc
          : OrderDirection.Desc
        : OrderDirection.Asc;
    dispatch(storageActions.setOrder({ by: orderBy, direction }));
  };
  const sortButtonFactory = () => {
    const IconComponent = order.direction === OrderDirection.Desc ? UilArrowDown : UilArrowUp;
    return <IconComponent className="ml-2" />;
  };

  return (
    <div className="flex h-full flex-grow flex-col bg-white">
      <div className="files-list flex border-b border-neutral-30 bg-white py-3 text-sm font-semibold text-neutral-500">
        <div className="box-content flex w-0.5/12 items-center justify-start pl-3">
          <input
            disabled={!hasItems}
            readOnly
            checked={isAllSelected()}
            onClick={onSelectAllButtonClicked}
            type="checkbox"
            className="pointer-events-auto"
          />
        </div>
        <div className="box-content flex w-1/12 cursor-pointer items-center px-3" onClick={() => sortBy('type')}>
          {t('drive.list.columns.type')}
          {order.by === 'type' && sortButtonFactory()}
        </div>
        <div className="flex flex-grow cursor-pointer items-center" onClick={() => sortBy('name')}>
          {t('drive.list.columns.name')}
          {order.by === 'name' && sortButtonFactory()}
        </div>
        <div className="hidden w-2/12 items-center xl:flex"></div>
        <div className="hidden w-3/12 cursor-pointer items-center lg:flex" onClick={() => sortBy('updatedAt')}>
          {t('drive.list.columns.modified')}
          {order.by === 'updatedAt' && sortButtonFactory()}
        </div>
        <div className="flex w-1/12 cursor-pointer items-center" onClick={() => sortBy('size')}>
          {t('drive.list.columns.size')}
          {order.by === 'size' && sortButtonFactory()}
        </div>
        <div className="flex w-1/12 items-center rounded-tr-4px">{t('drive.list.columns.actions')}</div>
      </div>
      <div className="h-full overflow-y-auto">
        {isLoading ? (
          loadingSkeleton
        ) : (
          <div id="scrollableList" className="flex h-full flex-col overflow-y-auto">
            <InfiniteScroll
              dataLength={itemsList.length}
              next={onEndOfScroll}
              hasMore={hasMoreItems}
              loader={loadingSkeleton}
              scrollableTarget="scrollableList"
              className="z-0 h-full"
              style={{ overflow: 'visible' }}
            >
              {itemsFolderList()}
              {itemsFileList()}
            </InfiniteScroll>
          </div>
        )}
      </div>
    </div>
  );
};

export default connect((state: RootState) => ({
  selectedItems: state.storage.selectedItems,
  order: state.storage.order,
}))(DriveExplorerList);
