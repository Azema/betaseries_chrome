# Extesion Chrome BetaSeries.com

L'extension chrome pour faciliter la vie des utilisateurs.

## Tester l'extension en local

- Se rendre sur <chrome://extensions>
- Activer le mode développeur
- Ensuite dans la barre qui apparait, juste cliquer sur 'Charger l'extension non empaquetée' => est sélectionner le dossier contenant toute l'extension.


## Préparer la mise en prod

- Exécuter la commande : `make build` afin d'installer les modules et de générer les fichiers de traduction


## Ajouter du texte dans la popup

Sur Loco, il faut nommer la clé sous le format `popup_'le nom juste en [a-zA-z_]'` et lui attribuer le tag `popup` afin que lors de la génération des traductions il soit bien mis au bon endroit
