const fs = require("fs");

const num_validators = 5;
const num_messages = 100;

function randomInteger(range) {
  // Returns random integer in [0,range)
  return Math.floor(Math.random() * range);
}

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

const latestMessages = function(messages) {
  // returns array of latest messages
  // -1 if x is equivocating or no message
  // assumes a validator always includes its latest previous message in a new message
  // O(m)
  return [...Array(num_validators).keys()].map(
    v => latestMessage(messages, v)
  );
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

const getEstimate = function(messages, ids_of_justification) {
  var wt_0 = 0, wt_1 = 0;
  justification = ids_of_justification.map(
    idx => messages[idx]
  );
  lastest_messages_in_justification = latestMessages(justification);
  // console.log(lastest_messages_in_justification);

  for (var i=0; i<lastest_messages_in_justification.length; i++) {
    if (lastest_messages_in_justification[i]!=-1) {
      if (messages[lastest_messages_in_justification[i]].estimate == 0) {
        wt_0++;
      }
      else {
        wt_1++;
      }
    }
  }

  if (wt_0 >= num_validators/2) {
    return 0;
  }
  else if (wt_1 >= num_validators/2) {
    return 1
  }

  return randomInteger(2);
}

const constructMessage = function(messages, m_sender, m_justification) {
  return {
    sender: m_sender,
    justification: m_justification,
    estimate: getEstimate(messages, m_justification),
    idx: all_messages.length
  };
}

// m = all_messages[4];
// console.log(retrieveMessages(all_messages, m.justification))
// console.log(m.justification);
// console.log(getEstimate(all_messages, m.justification));

all_messages = [];
for (var round=0; round < num_messages; round++) {
  message_producer = randomInteger(num_validators);
  new_msg = constructMessage(all_messages, message_producer, latestMessages(all_messages).filter(msg_id => msg_id!=-1));
  all_messages.push(new_msg);
}
var json = JSON.stringify(all_messages);
fs.writeFileSync('data/4val100msg.json', json, 'utf8');
console.log(all_messages);
