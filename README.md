# PaidUp Broker Service

>  PaidUp Broker
## Build Setup

``` bash
# install dependencies
npm install

# Set config base
> make a copy server/config/environment/index.base.js to server/config/environment/index.js

# build project
> npm run webpack

# start
> node dist/build.js