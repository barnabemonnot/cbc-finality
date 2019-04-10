const fs = require("fs");
const cbc = require("./cbc")
const _ = require("underscore");

function randomInteger(range) {
  // Returns random integer in [0,range)
  return Math.floor(Math.random() * range);
}

const getLatestMessages = function(validators, messages) {
  // returns array of latest messages
  // -1 if x is equivocating or no message
  // assumes a validator always includes its latest previous message in a new message
  // O(m)
  var highestMessage = new Array(validators).fill(-1);
  for (var i = 0; i < messages.length; i++) {
    if (highestMessage[messages[i].sender] == -1 || messages[i].justification.includes(highestMessage[messages[i].sender])) {
      highestMessage[messages[i].sender] = i;
    }
  }
  return highestMessage;
}

const previousMessage = function(messages, message_id) {
  // returns previous message from same sender
  // -1 if no previous message
  // O(v)
  var sender = messages[message_id].sender;
  var justification = messages[message_id].justification;
  for (var i=0; i<justification.length; i++) {
    if (messages[justification[i]].sender == sender) {
      return messages[justification[i]].idx;
    }
  }
  return -1;
}

const retrieveMessages = function(messages, list_of_ids) {
  retrieved_messages = [];
  // console.log(list_of_ids);
  for (var i=0; i<list_of_ids.length; i++) {
    retrieved_messages.push(messages[list_of_ids[i]]);
  }
  return retrieved_messages;
}

const getEstimate = function(validators, messages) {
  // console.log("estimate messages", messages);
  const estimateZero = messages.reduce(
    (acc, m) => {
      if (m.estimate == 0) return acc + 1;
      else return acc;
    }, 0
  )
  const estimateOne = messages.reduce(
    (acc, m) => {
      if (m.estimate == 1) return acc + 1;
      else return acc;
    }, 0
  )
  if (estimateZero > validators / 2) return 0;
  else if (estimateOne > validators / 2) return 1;
  else {
    console.log("randomizing");
    return randomInteger(2);
  }
}

const constructMessage = function(messages, m_sender, m_justification, m_idx) {
  return {
    sender: m_sender,
    justification: m_justification,
    estimate: getEstimate(messages, m_justification),
    idx: m_idx
  };
}

function latestMessageOfSender(sender, messages) {
  const messagesFromSender = messages.filter(
    m => m.sender == sender
  );
  if (messagesFromSender.length == 0) return null;
  else return messagesFromSender[messagesFromSender.length - 1];
}

const roundMax = 39;
const validators = 7;
var messages = [];
for (var round = 0; round < roundMax; round++) {
  const sender = (2*round) % validators;
  const latestMessage = latestMessageOfSender(sender, messages);
  const latestJustification = latestMessage ? latestMessage.justification : [];
  const latestIndex = latestMessage ? latestMessage.idx : -1;
  const messagesSince = messages.filter(
    m => m.idx > latestIndex
  );
  const messagesReceived = messagesSince.filter(
    m => Math.random() < 0.15
  );
  const justification = _.uniq(
    latestJustification.concat(
      messagesReceived.map(m => m.idx)
    )
    .concat(
      messagesReceived.reduce(
        (acc, m) => _.uniq(acc.concat(m.justification)),
        []
      )
    )
    .concat(latestIndex == -1 ? [] : [latestIndex])
  );
  const latestMessages = cbc.getLatestMessagesInJustification(
    validators,
    justification,
    messages
  );
  const estimate = getEstimate(validators, latestMessages);
  messages.push({
    idx: round,
    estimate: estimate,
    justification: justification,
    sender: sender
  });
}
