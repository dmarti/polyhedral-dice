#!/usr/bin/bash

set -e

HOST=citrus.zgp.org

trap popd EXIT
pushd $PWD
cd $(dirname "$0")

ssh $HOST mkdir -p /var/www/dice
rsync --delete -a ./ $HOST:/var/www/dice
scp *.conf $HOST:/etc/apache2/sites-available
ssh $HOST sudo a2ensite 013-dice
ssh $HOST sudo service apache2 restart
