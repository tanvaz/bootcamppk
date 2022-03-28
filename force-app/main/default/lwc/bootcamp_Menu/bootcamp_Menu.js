import { LightningElement, api, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import getMenu from '@salesforce/apex/BOT_Menu_Controller.getMenuItems';
import isGuestUser from '@salesforce/user/isGuest';

export default class Bootcamp_Menu extends LightningElement {
    @api menuName;
    @track menuItems = [];
    @track isLoaded = false;
    @track error;
    publishedState;
    @wire(getMenu, { 
        menuName: '$menuName',
        publishedState: '$publishedState'
    })
    wiredMenuItems({error, data}) {
        if (data && !this.isLoaded) {
            this.menuItems = data.map((item, index) => {
                return {
                    target: item.Target,
                    id: index,
                    label: item.Label,
                    defaultListViewId: item.DefaultListViewId,
                    type: item.Type,
                    accessRestriction: item.AccessRestriction
                }
            }).filter(item => {
                return item.accessRestriction === "None"
                        || (item.accessRestriction === "LoginRequired" && !isGuestUser);
            });
            this.error = undefined;
            this.isLoaded = true;
        } else if (error) {
            this.error = error;
            this.menuItems = [];
            this.isLoaded = true;
            console.log(`Navigation menu error: ${JSON.stringify(this.error)}`);
        }
    }

    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        const app = currentPageReference && currentPageReference.state && currentPageReference.state.app;
        if (app === 'commeditor') {
            this.publishedState = 'Draft';
        } else {
            this.publishedState = 'Live';
        }
    }
}