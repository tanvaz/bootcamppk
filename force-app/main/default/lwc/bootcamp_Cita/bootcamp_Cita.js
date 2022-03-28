import { LightningElement } from 'lwc';
import LEAD_OBJECT from '@salesforce/schema/Lead';
import NAME_FIELD from '@salesforce/schema/Lead.Name';
import EMAIL_FIELD from '@salesforce/schema/Lead.Email';
import COMPANY_FIELD from '@salesforce/schema/Lead.Company';
import CITY__C_FIELD from '@salesforce/schema/Lead.City__c';
import STATE__C_FIELD from '@salesforce/schema/Lead.State__c';

export default class Bootcamp_Cita extends LightningElement {
    leadObject = LEAD_OBJECT;
    leadFields = [NAME_FIELD,EMAIL_FIELD,COMPANY_FIELD,CITY__C_FIELD,STATE__C_FIELD];
}