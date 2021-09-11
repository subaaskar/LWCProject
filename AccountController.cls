public with sharing class AccountController {
    @AuraEnabled(cacheable=true)
    public static Integer getAccountsCount() {
        return [
            SELECT count()
            FROM Account
            WHERE CreatedDate = TODAY
        ];
    }
}
