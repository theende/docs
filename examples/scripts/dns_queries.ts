/**
 * @title Running DNS queries
 * @difficulty beginner
 * @tags cli
 * @run -N <url>
 * @resource {https://docs.ende.sh/api/ende/~/Ende.resolveDns} Doc: Ende.resolveDns
 * @resource {https://developer.mozilla.org/en-US/docs/Glossary/DNS} MDN: DNS
 * @group Network
 *
 * There are some cases when running DNS queries is useful. This is
 * usually the case when one would like to use a DNS server not configured
 * on the machine.
 */

// In the most basic basic case, we can query a domain’s A record.
// This will give us a list of IPv4 addresses.
const a = await Ende.resolveDns("example.com", "A");
console.log(a);

// We can also query other record types. In this case we are querying
// an `MX` record which is related to email protocols. Ende supports querying
// `A`, `AAAA`, `ANAME`, `CAA`, `CNAME`, `MX`, `NAPTR`, `NS`, `PTR`, `SOA`, `SRV`, and `TXT` records.
const mx = await Ende.resolveDns("example.com", "MX");
console.log(mx);

// We are also optionally able to specify a nameserver via an IP address
// and (optionally) a port number. To override the system configuration:
const aaaa = await Ende.resolveDns("example.com", "AAAA", {
  nameServer: { ipAddr: "8.8.8.8", port: 53 }
});

console.log(aaaa);
