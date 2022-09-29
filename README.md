## curl for /private page:

JWT token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJ1c2VyIiwiaWF0IjoxNjY0Mzc4NDU4fQ.M5vX6XLzY-8YqFeP8YkSPPIwHmMSA_uUqm3QbQXOAYA

> Used `jwt.sign({ access: "user" }, JWT_SECRET);` to create this token

curl -H 'Accept: application/json' -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJ1c2VyIiwiaWF0IjoxNjY0Mzc4NDU4fQ.M5vX6XLzY-8YqFeP8YkSPPIwHmMSA_uUqm3QbQXOAYA" localhost:7777/private

---

## curl for public page:

-    curl localhost:7777/

## curls for pages in different weights:

-    curl localhost:7777/2
-    curl localhost:7777/3
-    curl localhost:7777/4
-    curl localhost:7777/5

---

---

_Created Mocha+Chai tests in /test folder_
_Used Redis. Port: 7379_
