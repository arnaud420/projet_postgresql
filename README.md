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
 FLUSH PRIVILEGES ;
 ```

## Installation

 ```
git clone https://github.com/arnaud420/projet_postgresql.git

cd projet_postgresql

 npm install


 ```

## Lancement du script

```
 ./save -h
```

### Options

```
./save -r [backup-file]
```
Restaurer une base de donnée via un fichier de sauvegarde.

Authors:
- Antoine Chiny
- Arnaud Lafon
