public with sharing class BOT_Carousel_Controller {
    @AuraEnabled(cacheable=true)
    public static List<String> getImages() {
		List<Product2> publicLinks = [Select BOT_Imagen__c from Product2 WHERE IsActive = true AND BOT_Imagen__c != ''];
        List<String> urlDoc = new List<String>();
        if(publicLinks.size() > 0) {
            for(Product2 prod: publicLinks) {
                urlDoc.add(prod.BOT_Imagen__c);
            }
        }
        return urlDoc;
    }
}
