# flow.js
## Introduction

flow.js is a synchron-asynchron flow control library which runs on node and in browsers.
The functionallity of the library is inspired by node-seq (https://github.com/substack/node-seq) and async (https://github.com/caolan/async). The source is written from scratch.

## Development

flow.js is currently in an early state.

## Features

* sequence flow
* parallel flow

## Usage

### Create a flow and execute

```javascript

    flow()
       .exec(function (err, results) {
            if (err) {
                // some error inside the flow
            } else {
                // access to results
            }
       });
```
### Add a sequence

#### execute synchron method in sequence

```javascript
    flow()
       .seq(function(){
           // do something synchron
       })
       .exec(function (err, results) {           
       });

```

#### execute synchron method in sequence

```javascript
    flow()
       .seq(function(cb){
           // do something asynchron
           setTimeout(function(){
                // invoke callback
                cb(null, "result of this sequence");
           }, 1000);
       })
       .exec(function (err, results) {           
       });

```