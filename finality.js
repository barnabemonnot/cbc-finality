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

const fourValidatorsMessages = [{
  sender: 0,
  estimate: 1,
  justification: [],
  idx: 0
}, {
  sender: 1,
  estimate: 1,
  justification: [],
  idx: 0
}, {
  sender: 2,
  estimate: 1,
  justification: [],
  idx: 0
}, {
  sender: 3,
  estimate: 1,
  justification: [],
  idx: 0
}, {
  sender: 0,
  estimate: 1,
  justification: [0, 1, 2],
  idx: 0
}, {
  sender: 1,
  estimate: 1,
  justification: [0, 1],
  idx: 0
}, {
  sender: 2,
  estimate: 1,
  justification: [2],
  idx: 0
}, {
  sender: 3,
  estimate: 1,
  justification: [2, 3],
  idx: 0
}]

const latestMessage = function(messages, validator) {
  // -1 if x is equivocating or no message
  // assumes a validator always includes its latest previous message in a new message
  // O(m)
  var highestMessage = -1;
  for (var i = 0; i < messages.length; i++) {
    if (messages[i].sender == validator &&
      (highestMessage = -1 || message[i].justification.includes(highestMessage))) {
      highestMessage = i;
    }
  }
  return highestMessage;
}

const outputLobbyingGraph = function(messages, validators) {
  const latestMessages = validators.map(v => latestMessage(messages, v)); // O(nm)
  const pairs = validators.reduce(
    (acc, x) => acc.concat(validators.map(
      y => [x, y]
    )), []
  );
  return pairs.filter(
    d => messages[latestMessages[d[0]]].justification.map(
      msgidx => messages[msgidx].sender
    ).includes(d[1]) || d[0] == d[1]
  );
}

const pruneLobbyingGraph = function(lobbyingGraph, validators, q) {
  var pruned = [];
  var morePruning = true;
  while (morePruning) {
    console.log("doing more pruning");
    morePruning = false;
    for (var i = 0; i < validators.length; i++) {
      const v = validators[i];
      if (!pruned.includes(v)) {
        const outDegree = lobbyingGraph.filter(
          edge => edge[0] == v && !pruned.includes(edge[1])
        ).length;
        if (outDegree < q) {
          morePruning = true;
          console.log("pruning", v);
          pruned.push(v);
        }
      }
    }
  }
  return validators.filter(v => !pruned.includes(v));
}

const validators = [0, 1, 2, 3];
const lobbyingGraph = outputLobbyingGraph(fourValidatorsMessages, validators);
console.log(lobbyingGraph);
const s = pruneLobbyingGraph(lobbyingGraph, validators, 2);
console.log(s);
