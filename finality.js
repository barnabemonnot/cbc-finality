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

const laterMessages = function(messages, msgidx, validator) {
  return messages.filter(
    message => (
      message.sender == validator &&
      message.justification.includes(msgidx)
    )
  );
}

const outputLobbyingGraph = function(messages, validators, consensus) {
  const latestMessages = validators.map(v => latestMessage(messages, v)); // O(nm)
  const pairs = validators.reduce(
    (acc, x) => acc.concat(validators.map(
      y => [x, y]
    )), []
  );
  return pairs.filter(
    d => (
      latestMessages[d[0]] != -1 &&
      (
        messages[latestMessages[d[0]]].justification.map(
          msgidx => messages[msgidx]
        ).some( // O(m^2) = O(m) * O(m)
          message => (
            message.sender == d[1] &&
            laterMessages(messages, message.idx, d[1]).every( // O(m)
              laterMessage => laterMessage.estimate == consensus
            )
          )
        )
      )
    )
  ); // O(n^2 . m^2)
}

const pruneLobbyingGraph = function(lobbyingGraph, validators, q) {
  // O(n^2)
  var pruned = [];
  var morePruning = true;
  while (morePruning) { // O(n)
    console.log("doing more pruning");
    morePruning = false;
    for (var i = 0; i < validators.length; i++) { // O(n)
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

function isFutureOf(m1, m2, messages) {
  if (m1.justification.includes(m2.idx)) return true;
  else return m1.justification.some(
    m3idx => isFutureOf(messages[m3idx], m2, messages)
  );
}

function connectToMessages(message, messages) {
  return messages.filter(
    m1 => (
      message.justification.includes(m1.idx) &&
      !messages.some(
        m2 => isFutureOf(m2, m1, messages) && message.justification.includes(m2.idx)
      )
    )
  );
}

function edges(messages) {
  return messages.reduce(
    (acc, m1) => {
      const searchArray = connectToMessages(m1, messages);
      return acc.concat(
        searchArray.map(
          m2 => {
            return {
              source: m1.idx,
              target: m2.idx
            };
          }
        )
      );
    },
    []
  );
}

function levelZero(messages, consensus) {
  return messages.map(
    message => {
      return {
        sender: message.sender,
        estimate: message.estimate,
        justification: message.justification,
        level0: laterMessages(messages, message.idx, message.sender).every(
          laterMessage => laterMessage.estimate == consensus
        )
      };
    }
  )
}

function levelk(messages, consensus, k) {
  // return messages.
}

const validators = [0, 1, 2, 3];
console.log(edges(fourValidatorsMessages));
const lobbyingGraph = outputLobbyingGraph(fourValidatorsMessages, validators, 1);
console.log(lobbyingGraph);
const s = pruneLobbyingGraph(lobbyingGraph, validators, 2);
console.log(s);
