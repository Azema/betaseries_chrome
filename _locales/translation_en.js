/**
 * Loco js export: (Deprecated)
 * Project: BetaSeries Chrome
 * Release: Working copy
 * Locale: en-US, English (USA)
 * Exported by: Mathieu Thomas
 * Exported at: Wed, 17 Nov 2021 10:23:08 +0100 
 */ 
var t = function( pairs ){
    
    // named plural forms
    var pluralForms = [
    "one",
    "other"
];
    
    // calc numeric index of a plural form (0-1)
    function pluralIndex( n ){
        return Number( n != 1 );
    }

    // expose public t() function
    return function( msgid1, msgid2, n ){
        var value = pairs[msgid1];
        // singular if no multiplier
        if( null == n ){
            n = 1;
        }
        // plurals stored as objects, e.g. { one: "" }
        if( value instanceof Object ){
            value = value[ pluralForms[ pluralIndex(n) ] || 'one' ];
        }
        return value || ( 1 === n ? msgid1 : msgid2 ) || msgid1 || '';
    };
}(
    {
    "tabs.title": "BetaSeries Extension",
    "button.label.open": "Open",
    "title.page": "You will synchronize your SVOD platforms with your BetaSeries account",
    "label.login": "Sign in to BetaSeries",
    "label.button.login": "Sign in",
    "label.logout": "Sign out:",
    "explaination-syncro": "The platforms can be synchronized with your BetaSeries account. By clicking on the button next to the service icon, we will use your credentials cookies in order to link your accounts.",
    "explaination-syncro.sub-title": "For a seamless synchronization, please make sure that you are connected to the platforms on the same browser. Please open the corresponding websites on another tab.",
    "label.button.logout": "Log out",
    "thumbnails.label.service": "Service:",
    "thumbnails.label.state": "State:",
    "thumbnails.label.not-logged": "Not connected",
    "thumbnails.label.synchronized": "Synchronized",
    "thumbnails.label.resynchronized": "Re-sync",
    "thumbnails.label.logout-account": "Sign out",
    "modal.synchronization.title": "Account synchronization",
    "modal.load-account": "Your account is currently loading…",
    "modal.choice-profiles.netflix.title": "BetaSeries lets you automatically synchronize movies and shows you watch on Netflix to your BetaSeries account.",
    "modal.choice-profiles.netflix.label": "Choose your Netflix profile to sync:",
    "modal.syncOK.netflix": "Your Netflix account with the %login% profile is now synced.",
    "modal.empty-profiles.netflix": "Failed to retrieve profiles list from your <strong>%name%</strong> account.<br/>Please try again in a few minutes.",
    "modal.syncOK.arte": "Your account is now synced.",
    "modal.error-cookie": "Failed to retrieve cookies from your <strong>%name%<strong> account.<br/>Please make sure that you are connected to your account directly on <a href='%link%' target='_blank' rel='noopener noreferrer'>%link%</a>.",
    "modal.logout.label": "Your account is disconnected",
    "label.button.open": "Open",
    "popup_label_connection": "Sign in to your BetaSeries account:",
    "popup_button_connection": "Connection",
    "popup_button_settings": "Open",
    "popup_label_settings": "Go to SVOD platforms synchronisation:",
    "name_extension": "BetaSeries Extension",
    "thumbnails.label.sync": "Synchronize",
    "thumbnails.label.synced": "Synchronized",
    "thumbnails.label.loading": "Loading…",
    "thumbnails.label.never-synced": "No synchronization",
    "thumbnails.label.forceing-sync": "Forcing synchronization"
} 
);
