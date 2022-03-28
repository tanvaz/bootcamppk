import { LightningElement, api, wire, track } from 'lwc';
import getUrlImg from '@salesforce/apex/BOT_Carousel_Controller.getImages';

export default class Bootcamp_Carousel extends LightningElement {
    @api error;
    @api listUrls = [];

    @wire(getUrlImg)
    wiredContacts({ error, data }) {
        if (data) {
            console.log('data =====> '+JSON.stringify(data));
            this.listUrls = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.listUrls = undefined;
        }
    }
}