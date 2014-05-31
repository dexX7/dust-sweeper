Backend of http://redeem.bitwatch.co.

### Introduction

This project is intended to provide a tool to redeem unspent outputs from 
multisig transactions and uses an address indexed bitcoind version as well 
as nodejs.

Usage instructions can be found here:

http://mastercointalk.org/index.php?topic=353.msg1022#msg1022
https://bitcointalk.org/index.php?topic=573342.msg6336408#msg6336408

One of the address indexed bitcoind branches can be found here:

https://github.com/dexX7/bitcoin/tree/0.9.1-addrindex-minimal
https://github.com/dexX7/bitcoin/tree/0.9.1-addrindex-extended
https://github.com/dexX7/bitcoin/tree/master-addrindex-minimal
https://github.com/dexX7/bitcoin/tree/master-addrindex-extended

### Help requested

I went through the logs and there are many, many log entries which look 
like some kind of automated pen testing with over 9000 requests (no joke, 
to be more specific: 10760 at the very moment) from a single IP where the 
requests seem to be connected to http://www.tenable.com/products/nessus, 
for example: 

```
(...) "req":{"method":"GET","url":"/scripts/pwcgi/smpwservicescgi.exe?TARGET=http://www.nessus.org" (...)
(...) "req":{"method":"GET","url":"/cgi-bin/ikonboard.cgi?act=ST&f=1&t=1&hl=nessus&st='" (...)
(...) "req":{"method":"GET","url":"/scripts/index.php?show=http://xxx./nessus" (...)
```

But also a lot of stuff that looks like SQL injection attempts.

While there is nothing to get and this is solely a server to test builds 
and to run http://redeem.bitwatch.co, I'm still wondering, if this can be 
stopped in some way.

There is no dedicated webserver running, but only nodejs + some modules. 
This is my first attempt to do something with nodejs + AngularJS, so I 
wouldn't be surprised, if there are things that can be done better.

I'd be very thankful, if anyone could hint me in the direction which may 
help to block/mitigate unwanted queries.

This is a repost of:
http://mastercointalk.org/index.php?topic=353.msg1725#msg1725