#!/bin/bash

curl 'http://localhost:8080/saiku/rest/saiku/session' -H 'Content-Type: application/x-www-form-urlencoded' --data 'language=en&username=admin&password=admin' -c ./cookies.txt

curl 'http://localhost:8080/saiku/rest/saiku/admin/export/saiku/xls?file=/homes/home:admin/report1.saiku' -b cookies.txt  > export.xls

echo | mutt -a "./export.xls" -s "Scheduled Report Delivery" -- email@email.com
