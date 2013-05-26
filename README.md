[![build status](https://secure.travis-ci.org/it-ony/flow.js.png)](http://travis-ci.org/it-ony/flow.js)
[![NPM version](https://badge.fury.io/js/flow.js.png)](http://badge.fury.io/js/flow.js)
[![Dependency Status](https://david-dm.org/it-ony/flow.js.png)](https://david-dm.org/it-ony/flow.js)

# flow.js
## Introduction

flow.js is a synchron-asynchron flow control library which runs on node and in browsers.
The functionallity of the library is inspired by node-seq (https://github.com/substack/node-seq) and async (https://github.com/caolan/async). The source is written from scratch.

## Features

* sequence flow (seq)
* parallel flow (par) - executes functions in parallel
* parallel flow for each (parEach) - execute one function in parallel for each item inside a given as array or object
* seqEach - execute sequence for each function given as array
* end  - breaks the flow from inside an action

## Possible features (if somebody like or need)

* catch     - adds a catch action, which will handle erros instead of exec action
* autoexec  - automatically execute flow

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


#### sequence with variable registration

```javascript
    flow()
       .seq("myVar", function(){
           return "valueOfMyVar";
       })
       .exec(function (err, results) {
           console.log(results.myVar);
       });

```

### Add parallel control flow

#### asynchron and synchron control parallel control flows

```javascript
    flow()
       .par([
            function() {
                // synchron method
            },
            function (cb) {
                // asynchron method
            }
            // and even more
       ])
       .exec(function (err, results) {
       });

```

#### asynchron and synchron control parallel with variable registration

```javascript
    flow()
       .par({
            a: function() {
                // synchron method
                return 123;
            },
            b: function (cb) {
                // asynchron method
                setTimeout(function(){
                    cb(null, "I completed after 100ms");
                }, 100);
            }
            // and even more
       })
       .exec(function (err, results) {
            console.log(results);
            // results.a = 123;
            // results.b = "I completed after 100ms");
       });

```

#### synchron control parallel each without variable registration

```javascript
    flow()
        .parEach([1, 2, 3], function(value) {
            console.log(value);
        })
        .exec(function (err, results) {
            /*
                output in console could be
                    1      2      3
                    2  or  1  or  2  or ...
                    3      3      1
            */
        })

```

#### synchron control parallel each with variable registration

```javascript
    flow()
        .parEach({
            a: 1,
            b: 2,
            c: 3
        }, function(value) {
            return value*3;
        })
        .exec(function (err, results) {
            console.log(results);   // [3, 6, 9]
        })

```

#### asynchron control parallel each with and without variable registration

```javascript
    flow()
        .parEach(["do", "it"], function(value, cb) {
            setTimeout(function(){
                console.log(value); // synchron
            }, 10);
        })
        .parEach({
            a: 1,
            b: 2
        }, function(value, cb) {
                    setTimeout(function(){
                        cb(null, value*2);// doubles the value and saves it to a or b
                    }, 10);
                })
        .exec(function (err, results) {
            console.log(results);   // {a: 2, b: 4}
        })

```


### end flow from inside an synchron action

```javascript
    flow()
        .seq("a", function() {
            // do something
        }
        .par({
            b: function() {
                // do something synchron in parallel ...

                // end flow on condition
                if (condition) {
                    this.end(); // end flow after return statement
                    return -2;
                }

                return 2;
            },
            c: function(cb) {
                // ... with something asynchron

                // end flow the asynchron way
                this.end(null, 3); // or cb.end(null, 3) or cb(null, 3, true) or this(null, 3, true)
            }
        })
        .seq("e", function() {
            // this would executed, because either b or c will end the flow
        }
        .exec(function(err, results) {
            /* this function is called on
               * error thrown in synchron method
               * error object passed in asynchron method
               * this.end() is called
               * flow is executed completely
            */
        });
```

## Changelog

### 0.2.3

* added global error handler, which get called if an error occurs in exec block
