import { LightningElement, wire, track } from 'lwc';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent} from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';
import Product2_OBJECT from '@salesforce/schema/Product2';
import Car_Brand__c_FIELD from '@salesforce/schema/Product2.BOT_Marca__c';
import Car_model__c_FIELD from '@salesforce/schema/Product2.BOT_Model__c';
import Vehicle_type__c_FIELD from '@salesforce/schema/Product2.BOT_Tipo__c';
import insertProduct from '@salesforce/apex/BOT_NuevoProducto_Controller.insertProduct';
import uploadFile from '@salesforce/apex/BOT_NuevoProducto_Controller.uploadFile';
import getActiveProduct from '@salesforce/apex/BOT_Producto_Controller.getActiveProduct';
import { updateRecord } from 'lightning/uiRecordApi';

const columns = [
    // { label: 'Name', fieldName: 'Name', editable: true },
    { label: 'Modelo', fieldName: 'productName',  editable: true},
    { label: 'Marca', fieldName: 'productFamily', editable: true },
    { label: 'Imagen', fieldName: 'linkImage', type: 'image', editable: true },
    { label: 'Color', fieldName: 'color',  editable: true},
    { label: 'Precio', fieldName: 'price', type: 'currency', editable: true }
];

export default class Bootcamp_ProductoNuevo extends LightningElement {
    fileData = null;
    @track isOpen = false;
    @track vehicleValue = '';
    @track brandValue = '';
    @track modelValue = '';
    @track colorValue = '';
    @track priceValue = '';
    @track activeValue = false;
    columns = columns;
    @track productList = [];

    connectedCallback() {
        this.handleGetActiveProducts();
    }

    handleGetActiveProducts() {
        console.log('Entró a activeProducts');
        getActiveProduct()
        .then(result => {
            console.log('this.columns ======> '+JSON.stringify(this.columns));
            if(result.length > 0) {
                this.productList = result;
                console.log('this.productList ======> '+JSON.stringify(this.productList));
            } else {
                this.showToast('Error','error','No hay productos');
            }
        }).catch(error => {
            this.error = error;
            console.log('Error : '+JSON.stringify(error));
        })
    }

    openModal() {
        // to open modal set isOpen tarck value as true
        this.isOpen = true;
    }

    @wire(getObjectInfo, { objectApiName: Product2_OBJECT })
    prod2Metadata;
    @wire(getPicklistValues,
        {
            recordTypeId: '$prod2Metadata.data.defaultRecordTypeId', 
            fieldApiName: Vehicle_type__c_FIELD
        }
    ) typePicklist;
    @wire(getPicklistValues,
        {
            recordTypeId: '$prod2Metadata.data.defaultRecordTypeId', 
            fieldApiName: Car_Brand__c_FIELD
        }
    ) brandPicklist;
    @wire(getPicklistValues,
        {
            recordTypeId: '$prod2Metadata.data.defaultRecordTypeId', 
            fieldApiName: Car_model__c_FIELD
        }
    ) modelPicklist;

    handleSelectType(event){
        this.vehicleValue = event.detail.value;
    }
    handleSelectBrand(event){
        this.brandValue = event.detail.value;
    }
    handleSelectModel(event){
        this.modelValue = event.detail.value;
    }
    handleSelectColor(event){
        this.colorValue = event.detail.value;
    }
    handlePriceValue(event){
        this.priceValue = event.detail.value;
    }
    handleIsActive(event){
        this.activeValue = event.target.checked;
    }
    openfileUpload(event) {
        const file = event.target.files[0];
        var reader = new FileReader();
        reader.onload = () => {
            var base64 = reader.result.split(',')[1];
            this.fileData = {
                'fileName' : file.name,
                'base64' : base64,
                'recordId' : this.recordId
            }
            console.log('this.fileData =====> '+JSON.stringify(this.fileData));
        }
        reader.readAsDataURL(file);
    }

    submitDetails() {
        var product = {};
        product.productName = this.modelValue;
        product.productFamily = this.brandValue;
        product.color = this.colorValue;
        product.vehicle = this.vehicleValue;
        var jsonProduct = JSON.stringify(product);
        if(this.fileData == null) {
            this.showToast('Error','error','Se debe cargar una imagen para el producto');
        }
        insertProduct({
            newProduct : jsonProduct, 
            isActive : this.activeValue
        })
        .then(result => {
            this.fileData.recordId = result.Id;
            this.fileData.price = this.priceValue;
            const {base64, fileName, recordId, price} = this.fileData;
            uploadFile({base64, fileName, recordId, price})
            .then(result => {
                this.fileData = null;
                window.location.reload();
                this.showToast('Error','success','Producto creado');
                console.log('Si esta creado ');
            }).catch(error => {
                console.log('Error 1 : '+JSON.stringify(error));
            })
            this.isOpen = false;
        }).catch(error => {
            console.log('Error 2 : '+JSON.stringify(error));
        })
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
    
    showToast(textTitle, type, textMessage) {
        const toastEvent = new ShowToastEvent({
            title: textTitle,
            variant: type,
            message: textMessage
        })
        this.dispatchEvent(toastEvent);
    }

    closeQuickAction() {
        this.isOpen = false;
        this.dispatchEvent(new CloseActionScreenEvent());
    }
}