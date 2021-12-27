/**
 * Loco js export: (Deprecated)
 * Project: BetaSeries Chrome
 * Release: Working copy
 * Locale: fr-FR, French (France)
 * Exported by: Mathieu Thomas
 * Exported at: Wed, 17 Nov 2021 10:23:09 +0100 
 */ 
var t = function( pairs ){
    
    // named plural forms
    var pluralForms = [
    "one",
    "other"
];
    
    // calc numeric index of a plural form (0-1)
    function pluralIndex( n ){
        return Number( n > 1 );
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
    "tabs.title": "Extension BetaSeries",
    "button.label.open": "Ouvrir",
    "title.page": "Vous allez synchroniser vos plateformes SVOD avec votre compte BetaSeries",
    "label.login": "Se connecter à son compte BetaSeries",
    "label.button.login": "Connexion",
    "label.logout": "Se déconnecter de son compte :",
    "explaination-syncro": "Les services SVOD sont synchronisables automatiquement avec votre compte BetaSeries. En cliquant sur le bouton correspondant au service, nous allons utiliser vos cookies de connexion afin de connecter vos comptes ensemble.",
    "explaination-syncro.sub-title": "Pour une synchronisation sans soucis, merci d'être connecté sur les comptes depuis le même navigateur et d'ouvrir les pages des sites respectifs dans un nouvel onglet.",
    "label.button.logout": "Déconnexion",
    "thumbnails.label.service": "Service :",
    "thumbnails.label.state": "État :",
    "thumbnails.label.not-logged": "Pas connecté",
    "thumbnails.label.synchronized": "Synchronisé",
    "thumbnails.label.resynchronized": "Resynchroniser",
    "thumbnails.label.logout-account": "Déconnecter mon compte",
    "modal.synchronization.title": "Synchronisation de votre compte",
    "modal.load-account": "Chargement de votre compte en cours...",
    "modal.choice-profiles.netflix.title": "BetaSeries vous permet de synchroniser automatiquement les séries et les films que vous regardez sur Netflix sur votre compte BetaSeries.",
    "modal.choice-profiles.netflix.label": "Choisissez votre profil Netflix à synchroniser :",
    "modal.syncOK.netflix": "Votre compte Netflix avec le profil <strong>%login%</strong> est maintenant synchronisé.",
    "modal.empty-profiles.netflix": "Nous n'arrivons pas a récupérer les profils de votre compte<strong>%name%</strong>.<br/>Veuillez réessayer ultérieurement.",
    "modal.syncOK.arte": "Votre compte Arte est maintenant synchronisé.",
    "modal.error-cookie": "Nous n'arrivons pas a récupérer les cookies de votre compte <strong>%name%</strong>.<br/>Veuillez vous connecter à votre compte depuis la page du service <a href='%link%' target='_blank' rel='noopener noreferrer'>%link%</a>.",
    "modal.logout.label": "Votre compte est bien déconnecté",
    "label.button.open": "Ouvrir",
    "popup_label_connection": "Se connecter à son compte BetaSeries :",
    "popup_button_connection": "Connexion",
    "popup_button_settings": "Ouvrir",
    "popup_label_settings": "Accéder à la synchronisation des plateformes SVOD :",
    "name_extension": "Extension BetaSeries",
    "thumbnails.label.sync": "Synchroniser",
    "thumbnails.label.synced": "Synchronisé",
    "thumbnails.label.loading": "Chargement…",
    "thumbnails.label.never-synced": "Aucune synchronisation",
    "thumbnails.label.forceing-sync": "Forcer la synchronisation"
} 
);
