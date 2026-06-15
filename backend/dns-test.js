const dns = require("dns");

dns.resolveSrv(
  "_mongodb._tcp.cluster0.36hjtsn.mongodb.net",
  (err, addresses) => {
    console.log("ERROR:", err);
    console.log("ADDRESSES:", addresses);
  }
);