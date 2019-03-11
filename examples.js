const fs = require("fs");
const cbc = require("./cbc");

const introMessages = [{
  sender: 0,
  estimate: 1,
  justification: [],
  idx: 0
}, {
  sender: 1,
  estimate: 1,
  justification: [],
  idx: 1
}, {
  sender: 0,
  estimate: 0,
  justification: [0, 1],
  idx: 2
}];

const equivocatingMessages = [{
  sender: 0,
  estimate: 1,
  justification: [],
  idx: 0
}, {
  sender: 1,
  estimate: 1,
  justification: [],
  idx: 1
}, {
  sender: 2,
  estimate: 0,
  justification: [0, 1],
  idx: 2
}, {
  sender: 2,
  estimate: 1,
  justification: [0, 1],
  idx: 3
}];

const fourValidatorsMessages = [{
  sender: 0,
  estimate: 1,
  justification: [],
  idx: 0
}, {
  sender: 1,
  estimate: 1,
  justification: [],
  idx: 1
}, {
  sender: 2,
  estimate: 1,
  justification: [],
  idx: 2
}, {
  sender: 3,
  estimate: 1,
  justification: [],
  idx: 3
}, {
  sender: 0,
  estimate: 1,
  justification: [0, 1, 2],
  idx: 4
}, {
  sender: 1,
  estimate: 1,
  justification: [0, 1],
  idx: 5
}, {
  sender: 2,
  estimate: 1,
  justification: [2],
  idx: 6
}, {
  sender: 3,
  estimate: 1,
  justification: [2, 3],
  idx: 7
}, {
  sender: 3,
  estimate: 1,
  justification: [2, 3, 7],
  idx: 8
}];

const levelKMessages = [{
  sender: 0,
  estimate: 0,
  justification: [],
  idx: 0
}, {
  sender: 1,
  estimate: 0,
  justification: [],
  idx: 1
}, {
  sender: 0,
  estimate: 0,
  justification: [0, 1],
  idx: 2
}, {
  sender: 1,
  estimate: 0,
  justification: [1],
  idx: 3
}, {
  sender: 0,
  estimate: 0,
  justification: [0, 1, 2, 3],
  idx: 4
}, {
  sender: 1,
  estimate: 0,
  justification: [0, 1, 2, 3],
  idx: 5
}, {
  sender: 0,
  estimate: 0,
  justification: [0, 1, 2, 3, 4, 5],
  idx: 6
}];

const threeValidatorsK = [{
  sender: 0,
  estimate: 0,
  justification: [],
  idx: 0
}, {
  sender: 0,
  estimate: 0,
  justification: [0],
  idx: 1
}, {
  sender: 0,
  estimate: 0,
  justification: [0, 1, 3, 4, 6],
  idx: 2
}, {
  sender: 1,
  estimate: 0,
  justification: [],
  idx: 3
}, {
  sender: 1,
  estimate: 0,
  justification: [3, 6],
  idx: 4
}, {
  sender: 1,
  estimate: 0,
  justification: [0, 1, 3, 4, 6],
  idx: 5
}, {
  sender: 2,
  estimate: 0,
  justification: [],
  idx: 6
}, {
  sender: 2,
  estimate: 0,
  justification: [3, 6],
  idx: 7
}, {
  sender: 2,
  estimate: 0,
  justification: [3, 6, 7],
  idx: 8
}];

// 1)
// Follows example from the visual essay
console.log("////// 1");
const ackGraph = cbc.outputAcknowledgementGraph(fourValidatorsMessages, [0,1,2,3], 1);
console.log(ackGraph);
const s = cbc.pruneAcknowledgementGraph(ackGraph, [0,1,2,3], 2);
console.log(s);

// 2)
// Extra example
console.log("////// 2");
console.log(levelKMessages);
console.log(cbc.tagLevel(cbc.levelk(levelKMessages, 0, 2, 2), 3));
console.log(cbc.pruneLevelK(levelKMessages, [0, 1], 0, 2, 2));
console.log("//////");
console.log(cbc.pruneLevelK(levelKMessages.concat(
  [{ sender: 1, estimate: 0, justification: [0, 1, 2, 3, 4, 5], idx: 7 }]
), [0, 1], 0, 2, 2));


// 3)
// We remove equivocating validators before running the finality test
console.log("////// 3");
console.log(equivocatingMessages);
console.log(cbc.removeEquivocatingValidators(equivocatingMessages));


// 4)
// Follows example from the visual essay
console.log("////// 4");
console.log(cbc.pruneLevelK(threeValidatorsK, [0, 1, 2], 0, 2, 2));

// Reading a large log of messages
// We tag each message with the highest level it is at on consensus value 0
// const filename = 'data/12val220msg-lesser-sync';
// fs.readFile(filename+'.json', 'utf8', (err, data) => {
//   const messages = JSON.parse(data);
//   const taggedMessages = levelk(messages, 0, messages.length, 12);
//   const reTaggedMessages = tagLevel(taggedMessages, messages.length);
//   console.log(reTaggedMessages);
//   fs.writeFileSync(filename+"-ret.json", JSON.stringify(reTaggedMessages), 'utf8');
// });
