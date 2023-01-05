import BaseDialog from 'app/shared/components/BaseDialog/BaseDialog';
import { useState, useEffect, FC } from 'react';
import { DriveItemData } from '../../types';
import i18n from 'app/i18n/services/i18n.service';
import Button from 'app/shared/components/Button/Button';
import { IRoot } from 'app/store/slices/storage/storage.thunks/uploadFolderThunk';
import './RenameDialog.scss';

interface RenameDialogProps {
  isOpen: boolean;
  driveItems: (DriveItemData | IRoot)[];
  newItems: (File | IRoot)[];
  onCloseDialog(): void;
  onCancelButtonPressed(): void;
  onUploadReplacingButtonPressed(itemsToReplace: (DriveItemData | IRoot)[], itemsToUpload: (File | IRoot)[]): void;
  onUploadKeepingBothButtonPressed(itemToUpload: File | IRoot): void;
}
const RADIO_BUTTONS = {
  REPLACE: 0,
  KEEP: 1,
};

const RenameDialog: FC<RenameDialogProps> = ({
  isOpen,
  newItems,
  driveItems,
  onUploadKeepingBothButtonPressed,
  onUploadReplacingButtonPressed,
  onCancelButtonPressed,
  onCloseDialog,
}): JSX.Element => {
  const [itemsIndex, setItemsIndex] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<File | IRoot>({} as File);
  const [selectedDriveItem, setSelectedDriveItem] = useState<DriveItemData | IRoot>({} as DriveItemData);
  const [selectedRadioButton, setSelectedRadioButton] = useState<number>(0);

  useEffect(() => {
    setSelectedItem(newItems?.[0]);
    setSelectedDriveItem(driveItems?.[0]);
  }, [newItems, driveItems]);

  const nextItems = () => {
    const hasMoreItems = newItems.length - 1 > itemsIndex;
    if (hasMoreItems) {
      const newIndex = itemsIndex + 1;
      setSelectedItem(newItems?.[newIndex]);
      setSelectedDriveItem(driveItems?.[newIndex]);
      setItemsIndex(itemsIndex + 1);
      setSelectedRadioButton(RADIO_BUTTONS.REPLACE);
    } else {
      setItemsIndex(0);
      setSelectedItem({} as File);
      setSelectedDriveItem({} as DriveItemData);
      onCloseDialog();
      setSelectedRadioButton(RADIO_BUTTONS.REPLACE);
      onCancelButtonPressed();
    }
  };

  const title = 'Item already exists';
  const description = `${selectedItem?.name} already exists in this location. Do you want to replace it with with the one you’re moving?`;

  const onUploadButtonPressed = () => {
    if (selectedRadioButton === RADIO_BUTTONS.REPLACE) {
      onUploadReplacingButtonPressed([selectedDriveItem], [selectedItem]);
    } else {
      onUploadKeepingBothButtonPressed(selectedItem);
    }
    nextItems();
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      titleClasses="flex mx-5 text-left font-medium"
      panelClasses="text-neutral-900 flex flex-col absolute top-1/2 left-1/2 \
        transform -translate-y-1/2 -translate-x-1/2 w-max max-w-lg text-left justify-left pt-5 rounded-lg overflow-hidden bg-white"
      title={title}
      onClose={onCloseDialog}
      closeClass={'hidden'}
    >
      {/* Description */}
      <div className="justify-left w-fill block items-center bg-white py-6 text-left">
        <div className="ml-5">
          <span>{description}</span>
        </div>
        {/* Radio butttons */}
        <div className="ml-5 mt-5">
          <div className="form-check mb-3 flex items-center">
            <label className="container">
              Replace current item
              <input
                id="radio-1"
                type="radio"
                value={RADIO_BUTTONS.REPLACE}
                checked={selectedRadioButton === RADIO_BUTTONS.REPLACE}
                onChange={(e) => setSelectedRadioButton(parseInt(e.target.value))}
                name="radio"
              />
              <span className="checkDot"></span>
            </label>
          </div>
          <div className="flex items-center">
            <label className="container">
              Keep both
              <input
                id="radio-2"
                type="radio"
                value={RADIO_BUTTONS.KEEP}
                checked={selectedRadioButton === RADIO_BUTTONS.KEEP}
                onChange={(e) => setSelectedRadioButton(parseInt(e.target.value))}
                name="radio"
              />
              <span className="checkDot"></span>
            </label>
          </div>
        </div>

        {/* Modal buttons */}
        <div className="ml-auto mt-5 flex">
          <div className="tertiary square ml-5 mt-1 mr-auto h-8 w-28"></div>
          <Button variant="secondary" onClick={onCancelButtonPressed} className="mr-3">
            {i18n.get('actions.cancel')}
          </Button>
          <Button variant="primary" className="mr-5" onClick={onUploadButtonPressed}>
            Upload
          </Button>
        </div>
      </div>
    </BaseDialog>
  );
};

export default RenameDialog;
