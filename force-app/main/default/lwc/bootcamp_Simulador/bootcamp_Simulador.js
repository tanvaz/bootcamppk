import { LightningElement, api, track, wire } from 'lwc';
import calculatePayment from '@salesforce/apex/BOT_Simulador_Controller.calculatePayment'

const columns = [
    // { label: 'Name', fieldName: 'Name', editable: true },
    { label: '#Pay', fieldName: 'payNumber',  editable: false},
    { label: 'Unpaid Auto Balance', fieldName: 'unpaidBalance', type: 'currency', editable: false, typeAttributes: { maximumFractionDigits: 2, maximumFractionDigits: 0 } },
    { label: 'Monthly Auto Capital Payment', fieldName: 'monthAutoCap', type: 'currency', editable: false, typeAttributes: { maximumFractionDigits: 2, maximumFractionDigits: 0 } },
    { label: 'Monthly Payment of Auto Interest', fieldName: 'monthInterest', type: 'currency', editable: false, typeAttributes: { maximumFractionDigits: 2, maximumFractionDigits: 0 } },
    { label: 'Total payment with VAT', fieldName: 'totalPayment', type: 'currency', editable: false, typeAttributes: { maximumFractionDigits: 2, maximumFractionDigits: 0 } }
];

export default class Bootcamp_Simulador extends LightningElement {
    get modelOptions() {
        return [
            { label: '2022', value: '2022' },
            { label: '2021', value: '2021' },
            { label: '2020', value: '2020' },
            { label: '2019', value: '2019' },
            { label: '2018', value: '2018' },
        ];
    }

    get termOptions() {
        return [
            { label: '12', value: '12' },
            { label: '24', value: '24' },
            { label: '36', value: '36' },
        ];
    }

    @api amountRef;
    @api downPaymentRef;
    @api termRef;
    @track data = [];
    columns = columns;

    handleAmountChange(event){
        this.amountRef = event.detail.value;
    }

    handleDownPaymentChange(event){
        this.downPaymentRef = event.detail.value;
    }

    handleTermChange(event){
        this.termRef = event.detail.value;
    }

    handleClick(event) {
        console.log('?????? ====> ');
        calculatePayment({
            amount : this.amountRef,
            downP : this.downPaymentRef,
            term : this.termRef
        })
        .then(result =>{
            console.log('result.length ====> '+result.length);
            this.data = result;
        }).catch(error => {
            console.log('Error : '+JSON.stringify(error));
        })
    }

    downloadCSVFile() {   
        let rowEnd = '\n';
        let csvString = '';
        // this set elminates the duplicates if have any duplicate keys
        let rowData = new Set();

        // getting keys from data
        this.data.forEach(function (record) {
            Object.keys(record).forEach(function (key) {
                rowData.add(key);
            });
        });

        // Array.from() method returns an Array object from any object with a length property or an iterable object.
        rowData = Array.from(rowData);
        console.log('rowdata::::'+rowData);
        
        // splitting using ','
        csvString += rowData.join(',');
        csvString += rowEnd;
        // main for loop to get the data based on key value
        for(let i=0; i < this.data.length; i++){
            let colValue = 0;

            // validating keys in data
            for(let key in rowData) {
                if(rowData.hasOwnProperty(key)) {
                    // Key value 
                    // Ex: Id, Name
                    let rowKey = rowData[key];
                    // add , after every value except the first.
                    if(colValue > 0){
                        csvString += ',';
                    }
                    // If the column is undefined, it as blank in the CSV file.
                    let value = this.data[i][rowKey] === undefined ? '' : this.data[i][rowKey];
                    csvString += '"'+ value +'"';
                    colValue++;
                }
            }
            csvString += rowEnd;
        }
        console.log('csvString::::');
        console.log(csvString);

        // Creating anchor element to download
        let downloadElement = document.createElement('a');

        // This  encodeURI encodes special characters, except: , / ? : @ & = + $ # (Use encodeURIComponent() to encode these characters).
        downloadElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvString);
        downloadElement.target = '_self';
        // CSV File Name
        downloadElement.download = 'Simulator Data.csv';
        // below statement is required if you are using firefox browser
        document.body.appendChild(downloadElement);
        // click() Javascript function to download CSV file
        downloadElement.click(); 
    }
}