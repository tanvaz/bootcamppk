global without sharing class BOT_Menu_Controller {
    @AuraEnabled(cacheable=true)
    public static List<NavigationMenuItem> getMenuItems(String menuName,String publishedState) {
        if (String.isEmpty(menuName)) {
            return new List<NavigationMenuItem>();
        }

        String networkId = Network.getNetworkId();

        List<NavigationLinkSet> linkSets = [ SELECT Id FROM NavigationLinkSet WHERE DeveloperName =: menuName];

        Id linkSetId = linkSets.get(0).Id;

        return [ SELECT Label, Target, Type, DefaultListViewId, AccessRestriction, ParentId, Position, Status, TargetPrefs
            FROM NavigationMenuItem WHERE NavigationLinkSetId =: linkSetId AND Status = :publishedState ORDER BY Position
        ];
    }
}
