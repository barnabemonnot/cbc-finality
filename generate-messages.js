const fs = require("fs");
const _ = require("underscore");

const num_validators = 12;
const num_normal_messages = 150;
const num_active_messages = 70;

const active_validator_set = [3, 4, 5, 6, 7, 8, 9];

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
  var highestMessage = new Array(num_validators).fill(-1);
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
// console.log(retrieveMessages(all_messages, m.justification));
// console.log(m.justification);
// console.log(getEstimate(all_messages, m.justification));

all_messages = [];
var num_total_messages = num_normal_messages+num_active_messages;
var num_active_messages_produced = 0;
for (var round=0; round<num_total_messages; round++) {
  if(num_active_messages_produced<num_active_messages && randomInteger(num_total_messages)>num_active_messages) {
    message_producer = _.sample(active_validator_set);
    num_active_messages_produced++;
  }
  else {
    message_producer = randomInteger(num_validators);
  }
  var justification = latestMessages(all_messages).filter(msg_id => msg_id!=-1);
  for (var j=0; j<justification.length; j++) {
    var go_back = randomInteger(3);
    for (var p=0; p<go_back; p++) {
      if (justification[j]!=-1) {
        justification[j] = previousMessage(all_messages, justification[j]);
      }
      else {
        break;
      }
    }
  }
  justification = justification.filter(msg_id => msg_id!=-1);
  new_msg = constructMessage(all_messages, message_producer, justification);
  all_messages.push(new_msg);
}
var json = JSON.stringify(all_messages);
fs.writeFileSync('data/12val220msg-lesser-sync.json', json, 'utf8');
console.log(all_messages);
