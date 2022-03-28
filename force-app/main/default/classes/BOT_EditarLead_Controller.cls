public without sharing class BOT_EditarLead_Controller {
    @AuraEnabled(cacheable=true)
    public static List<Lead> webLeads(){
        return [
            SELECT Name, Last_Name__c, Email, Company, State__c, Owner.Name
            FROM Lead 
        ];
    }
}
