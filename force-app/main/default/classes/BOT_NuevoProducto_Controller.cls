public with sharing class BOT_NuevoProducto_Controller {
    @AuraEnabled
    public static Product2 insertProduct(String newProduct, Boolean isActive) {
        Product2 recProd = new Product2();
        productWrapper pw = (productWrapper) System.JSON.deserialize(newProduct, productWrapper.class);
        recProd.Name = pw.productName;
        recProd.BOT_Model__c = pw.productName;
        recProd.BOT_Tipo__c = pw.vehicle;
        recProd.IsActive = isActive;
        recProd.BOT_Marca__c = pw.productFamily;
        recProd.BOT_Color__c = pw.color;
        try {
            insert recProd;
            return recProd;
        } catch (DMLException e) {
            System.debug('Error : '+e);
            return null;
        }
    }

    @AuraEnabled
    public static String uploadFile(String base64, String fileName, String recordId, String price) {
        String pricebookId = [SELECT Id, Name FROM Pricebook2 WHERE Name = 'Standard Price Book'].Id;
        PricebookEntry pbEntry = createPricebookEntry(fileName, pricebookId, recordId, price);
        ContentVersion recCV = createContentVersion(base64, fileName);
        ContentDocumentLink recCDL = createContentDocLink(recCV.id, recordId);
        ContentDistribution contentDist = createPublicLink(recordId, fileName);
        Product2 updProduct = new Product2();
        updProduct.Id = recordId;
        updProduct.BOT_Imagen__c = [SELECT ContentDownloadUrl FROM ContentDistribution WHERE ContentVersionId =: recCV.Id].ContentDownloadUrl;
        if(recCV == null || recCDL == null) {
            System.debug('nulo');
            return null;
        }
        update updProduct;
        System.debug('updprod');
        System.debug(updProduct.id);
        return updProduct.id;
    }

    public static PricebookEntry createPricebookEntry(String fileName, String pricebookId, String productId, String price) {
        PricebookEntry pbEntry = new PricebookEntry();
        pbEntry.IsActive = true;
        pbEntry.Pricebook2Id = pricebookId;
        pbEntry.Product2Id = productId;
        pbEntry.UnitPrice = Decimal.valueOf(price);
        try {
            insert pbEntry;
        	return pbEntry;
        } catch (DMLException e) {
            System.debug('Error : '+e);
            return null;
        }
    }

    private static ContentVersion createContentVersion(String base64, String fileName) {
        ContentVersion recContent = new ContentVersion();
        recContent.VersionData = EncodingUtil.base64Decode(base64);
        recContent.Title = fileName;
        recContent.PathOnClient = fileName;
        try {
            insert recContent;
            return recContent;
        } catch (DMLException e) {
            System.debug('Error : '+e);
            return null;
        }
    }

    private static ContentDocumentLink createContentDocLink(String contentVersionId, String recordId) {
        if(contentVersionId == null || recordId == null) { return null; }
        ContentDocumentLink recCDL = new ContentDocumentLink();
        recCDL.ContentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE id =: contentVersionId].ContentDocumentId;
        recCDL.LinkedEntityId = recordId;
        recCDL.ShareType = 'V';
        try {
            insert recCDL;
            return recCDL;
        } catch (DMLException e) {
            System.debug('Error : '+e);
            return null;
        }
    }

    public static ContentDistribution createPublicLink(String recordId, String fileName){
        ContentDocumentLink cdl = [select contentdocument.id, contentdocument.title, contentdocument.filetype from contentdocumentlink where linkedentityid =: recordId];
        ContentVersion cv = [select id from contentversion where contentdocumentid = :cdl.contentdocument.id];
        ContentDistribution cd = new ContentDistribution();
        cd.Name = fileName;
        cd.ContentVersionId = cv.id;
        cd.PreferencesAllowViewInBrowser= true;
        cd.PreferencesLinkLatestVersion=true;
        cd.PreferencesAllowOriginalDownload= true;
        try {
            insert cd;
        	return cd;
        } catch (DMLException e) {
            System.debug('Error : '+e);
            return null;
        }
    }

    public class productWrapper {
        @AuraEnabled public String Id;
        @AuraEnabled public String productName;
        @AuraEnabled public String productCode;
        @AuraEnabled public String vehicle;
        @AuraEnabled public String productFamily;
        @AuraEnabled public String linkImage;
        @AuraEnabled public String color;
        @AuraEnabled public String price;
        @AuraEnabled public Boolean isActive;
        @AuraEnabled public String description;
    }
}
