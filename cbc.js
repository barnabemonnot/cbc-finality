const _ = require("underscore");

const latestMessage = function(messages, validator) {
  // Returns index of latest message from @validator in @messages
  // -1 if x is equivocating or no message
  // assumes a validator always includes its latest previous message in a new message
  // O(m)
  var highestMessage = -1;
  for (var i = 0; i < messages.length; i++) {
    if (messages[i].sender == validator &&
      (highestMessage == -1 || messages[i].justification.includes(highestMessage))) {
      highestMessage = i;
    }
  }
  return highestMessage;
};

const laterMessages = function(messages, msgidx, validator) {
  // Returns later messages from @validator after @msgidx in @messages
  return messages.filter(
    message => (
      message.sender == validator &&
      message.justification.includes(msgidx)
    )
  );
};

const getEquivocatingMessages = function(messages) {
  // Returns equivocating messages
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
};

const pruneMessages = function(messages, prunedValidators) {
  // Removes messages from pruned validators
  // Updates justification of remaining messages
  // to not point to removed messages
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
};

const removeEquivocatingValidators = function(messages) {
  // Remove equivocating messages and prune validators who equivocated
  const equivocatingMsgs = getEquivocatingMessages(messages);
  const equivocatingValidators = _.uniq(equivocatingMsgs.map(m => m.sender));
  return pruneMessages(messages, equivocatingValidators);
};

const outputAcknowledgementGraph = function(messages, validators, consensus) {
  // Graph for simple detector
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
};

const pruneAcknowledgementGraph = function(ackGraph, validators, q) {
  // O(n^2)
  var pruned = [];
  var morePruning = true;
  while (morePruning) { // O(n)
    console.log("doing more pruning");
    morePruning = false;
    for (var i = 0; i < validators.length; i++) { // O(n)
      const v = validators[i];
      if (!pruned.includes(v)) {
        const outDegree = ackGraph.filter(
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
};

const levelZero = function(messages, consensus) {
  // O(m^2)
  return messages.map( // O(m)
    m => {
      const n = {
        sender: m.sender,
        estimate: m.estimate,
        justification: m.justification.slice(),
        idx: m.idx
      }
      n.level0 = laterMessages(messages, m.idx, m.sender).every(
        laterMessage => laterMessage.estimate == consensus
      )
      return n;
    }
  )
};

const levelk = function(messages, consensus, k, q) {
  // For each message, determine if the message is at level k on consensus for q
  // O(km + m^2)
  if (k == 0) return levelZero(messages, consensus);
  else {
    const taggedMessages = levelk(messages, consensus, k-1, q);
    return taggedMessages.map(
      m => {
        const kLevelMessages = m.justification.map(
          msgidx => taggedMessages.find(m3 => m3.idx == msgidx)
        ).filter(
          m2 => m2["level"+(k-1)]
        );
        const newMessage = m;
        newMessage["level"+k] = kLevelMessages.length >= q;
        return newMessage;
      }
    );
  }
};

const pruneLevelK = function(messages, validators, consensus, k, q) {
  // We do the pruning by iterating over validators and pruning until either all
  // left satisfy the k-level property or none are left
  // console.log(messages);
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
    const kPrunedMessages = levelk(prunedMessages, consensus, k, q);
    // console.log("kPruned", kPrunedMessages);
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
};

const tagLevel = function(taggedMessages, kbound) {
  // From the messages with "level<k>" properties, obtain a single klevel attribute
  return taggedMessages.map(
    m => {
      var klevel = -1;
      for (var i = 0; i < kbound; i++) {
        if (m["level"+i]) klevel = i;
      }
      return {
        sender: m.sender,
        estimate: m.estimate,
        justification: m.justification.slice(),
        idx: m.idx,
        klevel: klevel
      }
    }
  )
};

module.exports = {
  latestMessage, laterMessages, getEquivocatingMessages, pruneMessages,
  removeEquivocatingValidators, outputAcknowledgementGraph,
  pruneAcknowledgementGraph, levelZero, levelk, pruneLevelK,
  tagLevel
}
