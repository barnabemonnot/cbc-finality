const _ = require("underscore");

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
}]

const latestMessage = function(messages, validator) {
  // -1 if x is equivocating or no message
  // assumes a validator always includes its latest previous message in a new message
  // O(m)
  var highestMessage = -1;
  for (var i = 0; i < messages.length; i++) {
    if (messages[i].sender == validator &&
      (highestMessage == -1 || message[i].justification.includes(highestMessage))) {
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

function getEquivocatingMessages(messages) {
  return messages.filter(
    m1 => messages.some(
      m2 => (
        m1.sender == m2.sender &&
        m1.estimate != m2.estimate &&
        !m1.justification.includes(m2.idx) &&
        !m2.justification.includes(m1.idx)
      )
    )
  );
}

const pruneMessages = function(messages, prunedValidators) {
  const prunedMessageIndices = messages.filter(
    m => prunedValidators.includes(m.sender)
  ).map(m => m.idx);
  return messages.filter(
    m => !prunedValidators.includes(m.sender)
  ).map(
    m => {
      return {
        sender: m.sender,
        estimate: m.estimate,
        justification: _.difference(m.justification, prunedMessageIndices),
        idx: m.idx
      };
    }
  );
}

const removeEquivocatingValidators = function(messages) {
  const equivocatingMsgs = getEquivocatingMessages(messages);
  const equivocatingValidators = _.uniq(equivocatingMsgs.map(m => m.sender));
  return pruneMessages(messages, equivocatingValidators);
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
      return _.extend(message, {
        level0: laterMessages(messages, message.idx, message.sender).every(
          laterMessage => laterMessage.estimate == consensus
        )
      });
    }
  )
}

function levelk(messages, consensus, k, q) {
  if (k == 0) return levelZero(messages, consensus);
  else {
    return levelk(messages, consensus, k-1, q).map(
      m => {
        const kLevelMessages = m.justification.map(
          msgidx => messages.find(m3 => m3.idx == msgidx)
        ).filter(
          m2 => m2["level"+(k-1)]
        );
        const newMessage = m;
        newMessage["level"+k] = kLevelMessages.length >= 2;
        return newMessage;
      }
    );
  }
}

const pruneLevelK = function(messages, validators, consensus, k, q) {
  console.log(messages);
  var prunedValidators = [];
  var prunedMessageIndices = [];
  var morePruning = true;
  while (morePruning) {
    console.log("doing more pruning");
    morePruning = false;

    // Remove messages from pruned validators, including the reference to these
    // messages in the justification of other messages
    const prunedMessages = messages.filter(
      m => !prunedValidators.includes(m.sender)
    ).map(
      m => {
        return {
          sender: m.sender,
          estimate: m.estimate,
          justification: _.difference(m.justification, prunedMessageIndices),
          idx: m.idx
        };
      }
    );

    // If no one left, we are done, the witness does not exist
    if (prunedMessages.length == 0) {
      return [];
    }

    // Compute the k-level property for remaining messages
    const kPrunedMessages = levelk(
      prunedMessages, consensus, k, q
    );
    for (var i = 0; i < validators.length; i++) { // O(n)
      const v = validators[i];

      // If a validator does not have a level k message, we prune it
      if (!prunedValidators.includes(v) && !kPrunedMessages.find(
        m => m.sender == v && m["level"+k]
      )) {
        morePruning = true;
        console.log("pruning", v);
        prunedValidators.push(v);
        prunedMessageIndices = prunedMessageIndices.concat(
          messages.filter(m => m.sender == v).map(m => m.idx)
        );
        break;
      }
    }
  }
  return validators.filter(v => !prunedValidators.includes(v));
}

// const validators = [0, 1, 2, 3];
// console.log(edges(fourValidatorsMessages));
// const lobbyingGraph = outputLobbyingGraph(fourValidatorsMessages, validators, 1);
// console.log(lobbyingGraph);
// const s = pruneLobbyingGraph(lobbyingGraph, validators, 2);
// console.log(s);

console.log("//////");
console.log(pruneLevelK(levelKMessages, [0, 1], 0, 2, 2));
console.log("//////");
console.log(pruneLevelK(levelKMessages.concat(
  [{ sender: 1, estimate: 0, justification: [0, 1, 2, 3, 4, 5], idx: 7 }]
), [0, 1], 0, 2, 2));
console.log(removeEquivocatingValidators(equivocatingMessages));
