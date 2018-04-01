# Projet postgresql


## Presentation du projet

Installation et configuration d'un serveur MySQL et mise en place de l'outil phpMyAdmin.

Installer et configurer apache2.

Créer un script permettant :

- De sauvegarder le serveur MySQL dans une archive compressee.
- De restaurer le serveur MySQL avec une sauvegarde specifique.
- De supprimer des sauvegardes au-dela d'une certaine duree (exemple : 7 jours).

## Prérequis

- MySQL.
- apache2.
- phpMyAdmin.
- Gestionnaire de paquet NPM. 
- NodeJs. 

Installation à partir d'une debian 8 ou 9 avec **sudo**, **MySQL** et **apache2** deja sur la machine.

**phpmyadmin** :

```
sudo apt-get install phpmyadmin
```

- Lors de l'installation mettre "oui" lorsqu'il est demandé de créer la base de donnée phpmyadmin. 
- Définir un mot de passe pour l'utilisateur MySQL phpmyadmin.
- Confirmer le mot de passe entré.
- Indiquer le mot de passe de l'utilisateur "root" de MySQL server.
- Choisir le server web à configurer (apache2).
- Se rendre sur "http://localhost/phpmyadmin" pour vérifier le bon fonctionnement de phpmyadmin. 

**NPM** :

```
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
```

**NodeJs** :

```
sudo apt-get install -y nodejs
```

## Prerequis

Ajout des privilèges ```mysql``` nécessaire à la sauvegarde.
 ```sql
 GRANT Show databases ON *.* TO 'USER'@'%' ;
 GRANT Select ON *.* TO 'USER'@'%' ;
 GRANT Drop ON *.* TO 'USER'@'%' ;
 GRANT Create ON *.* TO 'USER'@'%' ;
 GRANT Insert ON *.* TO 'USER'@'%' ; 
 FLUSH PRIVILEGES ;
 ```

## Installation

 ```bash
> git clone https://github.com/arnaud420/projet_postgresql.git
> cd projet_postgresql
> npm install

 ```

## Lancement du script

```
 ./save -h

  Usage: save [options]

  Options:

    -V, --version               output the version number
    -r, --restore [backupFile]  Restore a saved database.
    -s, --save [dbnames]        Save a specific database db1+db2+db3.
    -v, --verbose               Show logs.
    -l, --last [dbname]         Restore available backup for [dbname]
    -h, --help                  output usage information
```

### Options

> --save, -s
- Sauvegarde une/des base de données spécifiques.
- Si aucun arguments sauvegarde toutes les bases
- Exemple ```./save -s wordpress+employees```
> --restore, -r
- Restaurer une base de donnée avec une archive spécifique.
> --last, -l < nom bdd >
- Restaure la derniére sauvegarde.
> --verbose, -v
- Affiche les logs

### Configuration
```js
{
    // Informations de connection du client mysql.
    "database": {
        "client": "mysql",
        "connection": {
            "host": "127.0.0.1",
            "user": "user",
            "password": "password"
        }
    },
    // Nombre maximum de sauvegarde
    "save_retention": 5,
    // Databases ignorées lors d'un -s all
    "ignored_databases": [
        "information_schema",
        "mysql",
        "performance_schema"
    ],
    // Dossier ou son stocké les sauvegardes
    "backupPath": "./backups/"
}
```

Authors:
- Antoine Chiny
- Arnaud Lafon
