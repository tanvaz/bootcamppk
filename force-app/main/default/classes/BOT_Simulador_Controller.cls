public with sharing class BOT_Simulador_Controller {
    @AuraEnabled
    public static List<simulatorWrapper> calculatePayment(Decimal amount, Decimal downP, Integer term) {
        Decimal initUnpaidAuBa = amount - downP;
        Decimal initMonthPay = initUnpaidAuBa / term;
        Decimal initInterest = initMonthPay * .05;
        Decimal initTotalVat = ((initMonthPay + initInterest) * .05) + initMonthPay + initInterest;

        Decimal unBal = initUnpaidAuBa;

        List<simulatorWrapper> smw = new List<simulatorWrapper>();

        for (Integer i = 1; i <= term; i++) {
            simulatorWrapper payWr = new simulatorWrapper();
            payWr.payNumber = i;
            if (i == 1) {
                payWr.unpaidBalance = initUnpaidAuBa;
            } else {
                unBal = unBal - initMonthPay;
                payWr.unpaidBalance = unBal;
            }
            System.debug('unBal::::::'+unBal);
            payWr.monthAutoCap = initMonthPay;
            payWr.monthInterest = initInterest;
            System.debug('initTotalVat::::::'+initTotalVat);
            payWr.totalPayment = initTotalVat;
            smw.add(payWr);
        }

        System.debug('resultados :s '+smw);
        return smw;
    }
    public class simulatorWrapper {
        @AuraEnabled public Integer payNumber;
        @AuraEnabled public Decimal unpaidBalance;
        @AuraEnabled public Decimal monthAutoCap;
        @AuraEnabled public Decimal monthInterest;
        @AuraEnabled public Decimal totalPayment;
    }
}
