import { t } from 'i18next';
import { useState } from 'react';

import Button from 'app/shared/components/Button/Button';
import Modal from 'app/shared/components/Modal';
import DetailsInput from '../../../../components/DetailsInput';
import { BillingDetails } from '../../../../types/types';

const EditBillingDetailsModal = ({
  isOpen,
  onClose,
  billingDetails,
  onSave,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  billingDetails: BillingDetails;
  onSave: (billinDetails: BillingDetails) => void;
  isLoading?: boolean;
}) => {
  const MAX_INPUT_LENGHT = 50;
  const { address, phone } = billingDetails;
  const [editedAddress, setEditedAddress] = useState(address);

  const [editedPhone, setEditedPhone] = useState(phone || '');

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col space-y-5">
        <h1 className=" text-2xl font-medium leading-7">Billing Details</h1>
        <div className="flex grow flex-col space-y-4">
          <DetailsInput
            label="Address"
            textValue={editedAddress}
            onChangeTextValue={setEditedAddress}
            maxLength={MAX_INPUT_LENGHT}
            disabled={isLoading}
            hideMaxLength
          />
          {phone && (
            <DetailsInput
              label="Phone"
              textValue={editedPhone}
              onChangeTextValue={setEditedPhone}
              maxLength={MAX_INPUT_LENGHT}
              disabled={isLoading}
              hideMaxLength
            />
          )}
        </div>

        <div className="flex w-full flex-row justify-end space-x-2">
          <Button disabled={isLoading} variant="secondary" onClick={onClose}>
            {t('views.preferences.workspace.overview.editOverviewDetails.cancelButton')}
          </Button>
          <Button
            loading={isLoading}
            variant="primary"
            onClick={() =>
              onSave({
                address: editedAddress,

                phone: editedPhone,
              })
            }
          >
            {t('views.preferences.workspace.overview.editOverviewDetails.saveButton')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditBillingDetailsModal;
