# The Inspector: A CBC Casper finality test

Finality is crucial for the security and scalability of blockchains. As shards are added and larger data is stored, blockchain users want to be certain that whatever is written to the chain cannot be reverted.

Finality in Casper CBC is an emergent property of message-passing communication in the network. Validators become final on decisions with some degree of finality - the number of faults that must have occurred to facilitate valid proposal of contradictory decisions. As more communication supporting a decision is observed, a higher degree of finality is attained.

However, testing for finality is a hard problem. As messages form a complex network, naively finding a pattern of messages such that desired finality properties are satisfied is computationally expensive.

This repository contains a state-of-the-art, efficient algorithm for the CBC Casper framework to detect different degrees of finality, produced in Javascript. The algorithm supports consensus on binary decisions, but can be trivially extended to blocks under any latest message-driven fork choice rule.
