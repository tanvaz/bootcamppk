import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import webLeads from '@salesforce/apex/BOT_EditarLead_Controller.webLeads';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

const actions = [
    { label: 'Edit', name: 'edit' },
];

const columns = [
    { label: 'Name', fieldName: 'Name',  editable: true},
    { label: 'Last Name', fieldName: 'Last_Name__c', editable: true },
    { label: 'Email', fieldName: 'Email',  editable: true},
    { label: 'Company', fieldName: 'Company', editable: true},
    { label: 'State', fieldName: 'State__c', editable: true },
    {
        type: 'action',
        typeAttributes: { rowActions: actions },
    },
];
export default class Bootcamp_EditarLead extends LightningElement {
    columns = columns;
    @track leadList;
    fldsItemValues = [];

    @wire(webLeads)
    cons(result){
        this.leadList = result;
        if (result.error) {
            this.accObj = undefined;
        }
    };

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        this.recordId = row.Id;
        switch (actionName) {
            case 'edit':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        objectApiName: 'Lead',
                        actionName: 'edit'
                    }
                });
                break;
        }
    }

    handleSave(event) {
        this.fldsItemValues = event.detail.draftValues;
        const inputsItems = this.fldsItemValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });
        console.log('inputsItems:::::');
        console.log(inputsItems);

        const promises = inputsItems.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(res => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Records Updated Successfully!!',
                    variant: 'success'
                })
            );
            this.fldsItemValues = [];
            return this.refresh();
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'An Error Occured!!',
                    variant: 'error'
                })
            );
        }).finally(() => {
            this.fldsItemValues = [];
        });
    }

   
    async refresh() {
        await refreshApex(this.leadList);
    }
}