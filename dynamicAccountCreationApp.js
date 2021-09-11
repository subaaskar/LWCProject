
import { api, LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getAccountsCount from '@salesforce/apex/AccountController.getAccountsCount';
export default class DynamicAccountCreationApp extends NavigationMixin(LightningElement) {
    
    @api recordId;
    
    keyIndex = 0;
    @track itemList = [
        {
            id: 0
        }
    ];

    @track recordsCount;

    wiredResult;
    @wire(getAccountsCount) wiredCallbackResult(result){
        this.wiredResult = result;
        if(result.data){
            this.recordsCount = result.data;
        }
    }

    addRow() {
        ++this.keyIndex;
        var newItem = [{ id: this.keyIndex }];
        this.itemList = this.itemList.concat(newItem);
    }

    removeRow(event) {
        var arrLen = this.itemList.length;
        if (this.itemList.length >= 2) {
            //alert('inside if');
            this.itemList = this.itemList.filter(function (element) {
                return parseInt(element.id) < arrLen-1;
            });
        }
        else {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error deleting a row',
                    message: 'There should always be a minimum of 1 row displayed',
                    variant: 'warning',
                }),
            );
        }
    }

    handleSubmit() {
        var isVal = true;
        this.template.querySelectorAll('lightning-input-field').forEach(element => {
            isVal = isVal && element.reportValidity();
        });
        if (isVal) {
            this.template.querySelectorAll('lightning-record-edit-form').forEach(element => {
                element.submit();
            });
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Accounts successfully created',
                    variant: 'success',
                }),
            );
        } else {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating record',
                    message: 'Please enter all the required fields',
                    variant: 'error',
                }),
            );
        }
    }

    accountIdListToBeShown;
    handleSuccess(event) {
        console.log(event.detail.id);
        this.accountIdListToBeShown = event.detail.id;

        eval("$A.get('e.force:refreshView').fire();");
        refreshApex(this.wiredResult);
        
        // Navigate to the Account home page
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.accountIdListToBeShown,
                objectApiName: 'Account',
                actionName: 'view'
            },
        }).then(url => {
            window.open(url, "_blank");
        });
    }
}